import { sampleStart } from "./sample";
import { start } from "./main";
import { streamSampleStart } from "./stream-sample";

const error = (error: unknown): void => {
    console.error(error);
};
sampleStart().catch(error);
start().catch(error);
streamSampleStart();
