export type Doggo = {
  id: number;
  name: string;
  age: number;
  hasOwner?: boolean;
  size?: "big" | "small";
};

const dogs: Doggo[] = [
  {
    id: 1,
    age: 4,
    name: "Nico",
    hasOwner: true,
    size: "big",
  },
  {
    id: 2,
    age: 3,
    name: "Ed",
    hasOwner: false,
    size: "small",
  },
];

export default dogs;
