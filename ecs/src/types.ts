/** Anything that's a ComponentType is a class */
export interface ComponentType<T = unknown> {
    new(...args: any[]): T;
}

/** A component signature is a set of component types*/
export type ComponentSignature = Set<ComponentType>;

export type ComponentTypeList
    = [ComponentType]
    | ComponentType[];

// https://dev.t-matix.com/blog/platform/eimplementing-a-type-saf-ecs-with-typescript/
export type ComponentDataFromSignature<T> = {
    [P in keyof T]: T[P] extends ComponentType
    ? InstanceType<T[P]>
    : never
}

export type ComponentList = InstanceType<ComponentType>[];