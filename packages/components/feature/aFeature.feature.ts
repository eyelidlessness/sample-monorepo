export interface IPersonType {
    name: string;
    age: number;
}

export type PersonOrString = IPersonType | string;

export const person: IPersonType = {
    age: 5,
    name: 'john'
};

export class Person implements IPersonType {
    constructor(public age: number, public name: string) {}

    public sayHello = () => `Hello, my name is ${this.name} and my age is ${this.age}`;
}
