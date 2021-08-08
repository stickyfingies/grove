import GraphicsBackend from './backend.three';

const backend = new GraphicsBackend();

onmessage = ({ data }) => {
    const type = data.type as string;
    if (type in backend) backend[type](data);
    else throw new Error(`[render thread] command ${type} does not exist on this graphics backend`);
};
