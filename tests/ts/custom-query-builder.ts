import { Model, QueryBuilder } from '../../';

class CustomQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<M, R> {
  ArrayQueryBuilderType!: CustomQueryBuilder<M, M[]>;
  SingleQueryBuilderType!: CustomQueryBuilder<M, M>;
  NumberQueryBuilderType!: CustomQueryBuilder<M, number>;

  someCustomMethod() {
    return this;
  }
}

class BaseModel extends Model {
  QueryBuilderType: CustomQueryBuilder<this>;
}

class Animal extends BaseModel {
  id: number;
  name: string;
  owner: Person;
}

class Person extends BaseModel {
  firstName: string;
  pets: Animal[];
}

const people: Promise<Person[]> = Person.query()
  .someCustomMethod()
  .where('firstName', 'lol')
  .someCustomMethod()

const pets: Promise<Animal> = new Person()
  .$relatedQuery('pets')
  .someCustomMethod()
  .where('id', 1)
  .first()
  .someCustomMethod();

const numUpdated: Promise<number> = Person.query()
  .someCustomMethod()
  .patch({ firstName: 'test' })
  .someCustomMethod();