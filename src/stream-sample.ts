import { pipeline, Readable, Transform, TransformCallback } from "stream";

const uppercase = new Transform({
    transform(
        chunk: string | Buffer,
        _: string,
        callback: TransformCallback
    ): void {
        this.push(chunk.toString().toUpperCase());
        callback();
    },
});

export const streamSampleStart = (): void => {
    Readable.from(["a", "b", "c"]).pipe(uppercase).pipe(process.stdout);
    pipeline(Readable.from(["d", "e", "f"]), uppercase, (e) => {
        console.log(e);
    });
};
