import GraphicsBackend from './backend.three';
import { IGraphicsCommand } from './commands';

const backend = new GraphicsBackend();

onmessage = ({ data }: { data: IGraphicsCommand }) => {
    const { type } = data;
    // @ts-ignore - ignoring this warning allows for a stricter IGraphicsCommand,
    // and improves type safety overall.
    if (type in backend) backend[type](data);
    else throw new Error(`[render thread] command ${type} does not exist on this graphics backend`);
};