import { v4 } from 'uuid';

export type UserRequiredFields = {
  username: string,
  age: number,
  hobbies: string[],
}

export interface User extends UserRequiredFields {
  id: string,
}

export const users: User[] = [
  {id: v4(), username: 'John', age: 0, hobbies: []},
  {id: v4(), username: 'Sarah', age: 19, hobbies: ['studies']},
  {id: v4(), username: 'Kyle', age: 26, hobbies: ['time travels', 'lives saving']},
  {id: v4(), username: 'CSM-101', age: 0, hobbies: ['time travels', 'murder']},
]