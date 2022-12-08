import { pipeline, Readable, Transform, TransformCallback } from "stream";

// const collect = async <T>(asyncIterable: AsyncIterable<T>): Promise<T[]> => {
//     const res = [];
//     for await (const v of asyncIterable) {
//         res.push(v);
//     }
//     return res;
// };

async function* fetch(): AsyncGenerator<{ id: number }> {
    const array = [...Array(10).keys()].map(
        (i) =>
            new Promise((resolve: (value: { id: number }) => void) =>
                resolve({ id: i })
            )
    );
    for await (const record of array) {
        yield record;
    }
}

const transformIterable = <I, O>(
    iterable: Iterable<I> | AsyncIterable<I>,
    transformObject: (
        chunk: I,
        callback: TransformCallback,
        stream: Transform
    ) => void | Promise<void>
): AsyncIterable<O> => {
    const transformStream = new Transform({
        objectMode: true,
        highWaterMark: 32,
        async transform(chunk: I, _, callback) {
            try {
                await transformObject(chunk, callback, this);
            } catch (error) {
                callback(error as Error);
            }
        },
    });
    return pipeline(Readable.from(iterable), transformStream, () => {});
};

export const mapIterable = <I, O>(
    iterable: Iterable<I> | AsyncIterable<I>,
    load: (chunk: I) => O | Promise<O>
): AsyncIterable<O> => {
    return transformIterable<I, O>(iterable, async (chunk, callback) => {
        callback(undefined, await load(chunk));
    });
};

export const start = async (): Promise<void> => {
    mapIterable(fetch(), async (result): Promise<{ id: number }> => {
        return await Promise.resolve(result);
    });
    await Promise.resolve();
    // const a = await collect(res);
    // console.log(a);
};
