const sleep = (): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, 100);
    });

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

async function* slowTransform(
    ns: AsyncIterable<{ id: number }>
): AsyncGenerator<{ id: number }> {
    for await (const record of ns) {
        await sleep();
        yield { id: record.id ** record.id };
    }
}

async function transform(ns: { id: number }): Promise<{ id: number }> {
    await sleep();
    return { id: ns.id ** ns.id };
}

async function fastTransform(
    ns: AsyncIterable<{ id: number }>
): Promise<Promise<{ id: number }>[]> {
    const res = [];
    for await (const record of ns) {
        res.push(transform(record));
    }
    return res;
}

export const sampleStart = async (): Promise<void> => {
    // serial
    const start = new Date();
    for await (const record of slowTransform(fetch())) {
        console.log(record);
    }
    console.log(`time: ${new Date().getTime() - start.getTime()}`);

    // concurrency
    const start2 = new Date();
    for (const record of await fastTransform(fetch())) {
        console.log(record);
    }
    console.log(`time: ${new Date().getTime() - start2.getTime()}`);
};
