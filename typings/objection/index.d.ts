/// <reference types="node" />

// Type definitions for Objection.js
// Project: <http://vincit.github.io/objection.js/>
//
// Contributions by:
// * Matthew McEachen <https://github.com/mceachen>
// * Sami Koskimäki <https://github.com/koskimas>
// * Mikael Lepistö <https://github.com/elhigu>
// * Joseph T Lapp <https://github.com/jtlapp>
// * Drew R. <https://github.com/drew-r>
// * Karl Blomster <https://github.com/kblomster>
// * And many others: See <https://github.com/Vincit/objection.js/blob/master/typings/objection/index.d.ts>

import * as knex from 'knex';
import * as ajv from 'ajv';

export = Objection;

declare namespace Objection {
  const raw: RawFunction;
  const lit: LiteralFunction;
  const ref: ReferenceFunction;

  const compose: ComposeFunction;
  const mixin: MixinFunction;

  const snakeCaseMappers: SnakeCaseMappersFactory;
  const knexSnakeCaseMappers: KnexSnakeCaseMappersFactory;

  type QBType = 'Array' | 'Single' | 'Number' | 'Page';

  export interface RawBuilder extends Aliasable {}

  export interface RawFunction extends RawInterface<RawBuilder> {}
  export interface RawInterface<R> {
    (sql: string, ...bindings: any[]): R;
  }

  export interface LiteralBuilder extends Castable {}
  export interface LiteralFunction {
    (
      value: PrimitiveValue | PrimitiveValue[] | PrimitiveValueObject | PrimitiveValueObject[]
    ): LiteralBuilder;
  }

  export interface ReferenceBuilder extends Castable {}
  export interface ReferenceFunction {
    (expression: string): ReferenceBuilder;
  }

  export interface ComposeFunction {
    (...plugins: Plugin[]): Plugin;
    (plugins: Plugin[]): Plugin;
  }

  export interface Plugin {
    <M extends typeof Model>(modelClass: M): M;
  }

  export interface MixinFunction {
    // Using ModelClass<M> causes TS 2.5 to render ModelClass<any> rather
    // than an identity function type. <M extends typeof Model> retains the
    // model subclass type in the return value, without requiring the user
    // to type the Mixin call.
    <MC extends typeof Model>(modelClass: MC, ...plugins: Plugin[]): MC;
    <MC extends typeof Model>(modelClass: MC, plugins: Plugin[]): MC;
  }

  interface Aliasable {
    as(alias: string): this;
  }

  interface Castable extends Aliasable {
    castText(): this;
    castInt(): this;
    castBigInt(): this;
    castFloat(): this;
    castDecimal(): this;
    castReal(): this;
    castBool(): this;
    castJson(): this;
    castArray(): this;
    asArray(): this;
    castType(sqlType: string): this;
    castTo(sqlType: string): this;
  }

  type Raw = RawBuilder;
  type Operator = string;
  type NonPrimitiveValue = Raw | ReferenceBuilder | LiteralBuilder | AnyQueryBuilder;
  type ColumnRef = string | Raw | ReferenceBuilder;
  type TableRef = ColumnRef | AnyQueryBuilder;

  type PrimitiveValue =
    | string
    | number
    | boolean
    | Date
    | string[]
    | number[]
    | boolean[]
    | Date[]
    | null
    | Buffer;

  type Value = NonPrimitiveValue | PrimitiveValue;

  type Id = string | number;
  type CompositeId = Id[];
  type MaybeCompositeId = Id | CompositeId;

  interface ValueObject {
    [key: string]: Value;
  }

  interface PrimitiveValueObject {
    [key: string]: PrimitiveValue;
  }

  interface CallbackVoid<T> {
    (this: T, arg: T): void;
  }

  type Identity<T> = (value: T) => T;
  type AnyQueryBuilder = QueryBuilder<any>;
  type AnyModelClass = typeof Model;
  type Modifier<QB extends AnyQueryBuilder = AnyQueryBuilder> =
    | ((qb: QB) => void)
    | string
    | object;
  type OrderByDirection = 'asc' | 'desc' | 'ASC' | 'DESC';

  interface Modifiers<QB extends AnyQueryBuilder = AnyQueryBuilder> {
    [key: string]: Modifier<QB>;
  }

  // TODO: This can be improved by typing the object using M's relations.
  type RelationExpression<M extends Model> = string | object;

  /**
   * If T is an array, returns the item type, otherwise returns T.
   */
  type ItemType<T> = T extends Array<unknown> ? T[number] : T;

  /**
   * Type for keys of non-function properties of T.
   */
  type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];

  /**
   * Any object that has some of the properties of model class T match this type.
   */
  type PartialModelObject<T extends Model> = {
    [K in NonFunctionPropertyNames<T>]?: Exclude<T[K], undefined> extends Model
      ? T[K]
      : Exclude<T[K], undefined> extends Array<infer I>
      ? (I extends Model ? I[] : (T[K] | NonPrimitiveValue))
      : (T[K] | NonPrimitiveValue)
  } &
    object;

  /**
   * Additional optional parameters that may be used in graphs.
   */
  type GraphParameters = {
    '#dbRef'?: MaybeCompositeId;
    '#ref'?: string;
    '#id'?: string;
  };

  /**
   * Just like PartialModelObject but this is applied recursively to relations.
   */
  type PartialModelGraph<T> = {
    [K in NonFunctionPropertyNames<T>]?: Exclude<T[K], undefined> extends Model
      ? PartialModelGraph<Exclude<T[K], undefined>>
      : Exclude<T[K], undefined> extends Array<infer I>
      ? (I extends Model ? PartialModelGraph<I>[] : (T[K] | NonPrimitiveValue))
      : (T[K] | NonPrimitiveValue)
  } &
    GraphParameters;

  /**
   * Extracts the model type from a query builder type QB.
   */
  type ModelType<QB extends AnyQueryBuilder> = QB['ModelType'];

  /**
   * Extracts the result type from a query builder type QB.
   */
  type ResultType<QB extends AnyQueryBuilder> = QB['ResultType'];

  /**
   * Extracts the property names of the query builder's model class.
   */
  type ModelProps<QB extends AnyQueryBuilder, M extends ModelType<QB> = ModelType<QB>> = Exclude<
    NonFunctionPropertyNames<M>,
    'QueryBuilderType'
  >;

  /**
   * Gets the single item query builder type for a query builder.
   */
  type SingleQueryBuilder<QB extends AnyQueryBuilder> = QB['SingleQueryBuilderType'];

  /**
   * Gets the multi-item query builder type for a query builder.
   */
  type ArrayQueryBuilder<QB extends AnyQueryBuilder> = QB['ArrayQueryBuilderType'];

  /**
   * Gets the number query builder type for a query builder.
   */
  type NumberQueryBuilder<QB extends AnyQueryBuilder> = QB['NumberQueryBuilderType'];

  /**
   * Gets the page query builder type for a query builder.
   */
  type PageQueryBuilder<QB extends AnyQueryBuilder> = QB['PageQueryBuilderType'];

  interface ForClassMethod {
    <M extends typeof Model>(modelClass: M): InstanceType<M>['QueryBuilderType'];
  }

  type Selection<QB extends AnyQueryBuilder> = ColumnRef | AnyQueryBuilder | CallbackVoid<QB>;

  interface SelectMethod {
    <QB extends AnyQueryBuilder, AQB extends AnyQueryBuilder>(this: QB, ...columns: Selection<AQB>[]): QB;
    <QB extends AnyQueryBuilder, AQB extends AnyQueryBuilder>(this: QB, columns: Selection<AQB>[]): QB;
  }

  interface FromMethod {
    <QB extends AnyQueryBuilder>(this: QB, table: string): QB;
    <QB extends AnyQueryBuilder>(this: QB, cb: CallbackVoid<QB>): QB;
    <QB extends AnyQueryBuilder>(this: QB, raw: Raw): QB;
    <QB extends AnyQueryBuilder, QBA extends AnyQueryBuilder>(this: QB, qb: QBA): QB;
  }

  type DeriveQBType<QB extends AnyQueryBuilder, Type extends QBType> =
    Type extends 'Array' ? QB['ArrayQueryBuilderType'] :
    Type extends 'Single' ? QB['SingleQueryBuilderType'] :
    Type extends 'Number' ? QB['NumberQueryBuilderType'] :
    Type extends 'Page' ? QB['PageQueryBuilderType'] :
    never;

  interface WhereMethod<Type extends QBType> {
    // These must come first so that we get autocomplete.
    <QB extends AnyQueryBuilder, QBP extends QB>(this: QB, col: ModelProps<QBP>, op: Operator, value: Value): DeriveQBType<QB, Type>;
    <QB extends AnyQueryBuilder, QBP extends QB>(this: QB, col: ModelProps<QBP>, value: Value): DeriveQBType<QB, Type>;

    <QB extends AnyQueryBuilder>(this: QB, col: ColumnRef, op: Operator, value: Value): DeriveQBType<QB, Type>;
    <QB extends AnyQueryBuilder>(this: QB, col: ColumnRef, value: Value): DeriveQBType<QB, Type>;

    <QB extends AnyQueryBuilder>(this: QB, condition: boolean): DeriveQBType<QB, Type>;
    <QB extends AnyQueryBuilder>(this: QB, cb: CallbackVoid<QB>): DeriveQBType<QB, Type>;
    <QB extends AnyQueryBuilder>(this: QB, raw: Raw): DeriveQBType<QB, Type>;
    <QB extends AnyQueryBuilder, QBA extends AnyQueryBuilder>(this: QB, qb: QBA): DeriveQBType<QB, Type>;

    <QB extends AnyQueryBuilder>(this: QB, obj: PartialModelObject<ModelType<QB>>): DeriveQBType<QB, Type>;
    // We must allow any keys in the object. The previous type
    // is kind of useless, but maybe one day vscode and other
    // tools can autocomplete using it.
    <QB extends AnyQueryBuilder>(this: QB, obj: object): DeriveQBType<QB, Type>;
  }

  interface WhereWrappedMethod {
    <QB extends AnyQueryBuilder>(this: QB, cb: CallbackVoid<QB>): QB;
  }

  interface WhereExistsMethod {
    <QB extends AnyQueryBuilder>(this: QB, cb: CallbackVoid<QB>): QB;
    <QB extends AnyQueryBuilder>(this: QB, raw: Raw): QB;
    <QB extends AnyQueryBuilder, QBA extends AnyQueryBuilder>(this: QB, qb: QBA): QB;
  }

  interface WhereInMethod {
    // These must come first so that we get autocomplete.
    <QB extends AnyQueryBuilder, QBP extends QB>(this: QB, col: ModelProps<QBP>, value: Value): QB;
    <QB extends AnyQueryBuilder, QBP extends QB>(this: QB, col: ModelProps<QBP>, cb: CallbackVoid<QB>): QB;
    <QB extends AnyQueryBuilder, QBP extends QB>(this: QB, col: ModelProps<QBP>, qb: AnyQueryBuilder): QB;

    <QB extends AnyQueryBuilder>(this: QB, col: ColumnRef | ColumnRef[], value: Value[]): QB;
    <QB extends AnyQueryBuilder>(this: QB, col: ColumnRef | ColumnRef[], cb: CallbackVoid<QB>): QB;
    <QB extends AnyQueryBuilder>(this: QB, col: ColumnRef | ColumnRef[], qb: AnyQueryBuilder): QB;
  }

  type QBOrCallback<QB extends AnyQueryBuilder> = AnyQueryBuilder | CallbackVoid<QB>;

  interface SetOperations extends BaseSetOperations {
    <QB extends AnyQueryBuilder>(this: QB, ...callbacksOrBuilders: QBOrCallback<QB>[]): QB;
  }

  interface BaseSetOperations {
    <QB extends AnyQueryBuilder>(this: QB, callbackOrBuilder: QBOrCallback<QB>, wrap?: boolean): QB;
    <QB extends AnyQueryBuilder>(this: QB, callbacksOrBuilders: QBOrCallback<QB>[], wrap?: boolean): QB;
  }

  interface UnionMethod extends BaseSetOperations {
    <QB extends AnyQueryBuilder>(this: QB, arg1: QBOrCallback<QB>, wrap?: boolean): QB;
    <QB extends AnyQueryBuilder>(this: QB, arg1: QBOrCallback<QB>, arg2: QBOrCallback<QB>, wrap?: boolean): QB;
    <QB extends AnyQueryBuilder>(this: QB, arg1: QBOrCallback<QB>, arg2: QBOrCallback<QB>, arg3: QBOrCallback<QB>, wrap?: boolean): QB;
    <QB extends AnyQueryBuilder>(this: QB, 
      arg1: QBOrCallback<QB>,
      arg2: QBOrCallback<QB>,
      arg3: QBOrCallback<QB>,
      arg4: QBOrCallback<QB>,
      wrap?: boolean
    ): QB;
    <QB extends AnyQueryBuilder>(this: QB, 
      arg1: QBOrCallback<QB>,
      arg2: QBOrCallback<QB>,
      arg3: QBOrCallback<QB>,
      arg4: QBOrCallback<QB>,
      arg5: QBOrCallback<QB>,
      wrap?: boolean
    ): QB;
    <QB extends AnyQueryBuilder>(this: QB, 
      arg1: QBOrCallback<QB>,
      arg2: QBOrCallback<QB>,
      arg3: QBOrCallback<QB>,
      arg4: QBOrCallback<QB>,
      arg5: QBOrCallback<QB>,
      arg6: QBOrCallback<QB>,
      wrap?: boolean
    ): QB;
    <QB extends AnyQueryBuilder>(this: QB, 
      arg1: QBOrCallback<QB>,
      arg2: QBOrCallback<QB>,
      arg3: QBOrCallback<QB>,
      arg4: QBOrCallback<QB>,
      arg5: QBOrCallback<QB>,
      arg6: QBOrCallback<QB>,
      arg7: QBOrCallback<QB>,
      wrap?: boolean
    ): QB;
  }

  interface JoinRelationOptions {
    alias?: string | boolean;
    aliases?: Record<string, string>;
  }

  interface JoinRelationMethod {
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(this: QB, expr: RelationExpression<M>, opt?: JoinRelationOptions): QB;
  }

  interface JoinMethod {
    <QB extends AnyQueryBuilder>(this: QB, table: TableRef, leftCol: ColumnRef, op: Operator, rightCol: ColumnRef): QB;
    <QB extends AnyQueryBuilder>(this: QB, table: TableRef, leftCol: ColumnRef, rightCol: ColumnRef): QB;
    <QB extends AnyQueryBuilder>(this: QB, table: TableRef, cb: CallbackVoid<knex.JoinClause>): QB;
    <QB extends AnyQueryBuilder>(this: QB, table: TableRef, raw: Raw): QB;
    <QB extends AnyQueryBuilder>(this: QB, raw: Raw): QB;
  }

  interface IncrementDecrementMethod {
    <QB extends AnyQueryBuilder>(this: QB, column: string, amount?: number): QB;
  }

  interface OrderByMethod {
    <QB extends AnyQueryBuilder>(this: QB, column: ColumnRef, order?: OrderByDirection): QB;
    <QB extends AnyQueryBuilder>(this: QB, columns: ({ column: ColumnRef; order?: OrderByDirection } | ColumnRef)[]): QB;
  }

  interface FindByIdMethod {
    <QB extends AnyQueryBuilder>(this: QB, id: MaybeCompositeId): SingleQueryBuilder<QB>;
  }

  interface FindByIdsMethod {
    <QB extends AnyQueryBuilder>(this: QB, ids: MaybeCompositeId[]): QB;
  }

  interface FirstMethod {
    <QB extends AnyQueryBuilder>(this: QB): QB extends ArrayQueryBuilder<QB>
      ? SingleQueryBuilder<QB>
      : QB;
  }

  interface CastToMethod {
    <M extends typeof Model>(modelClass: M): InstanceType<M>['QueryBuilderType'];
  }

  interface UpdateMethod {
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(this: QB, update: PartialModelObject<M>): NumberQueryBuilder<QB>;
  }

  interface UpdateAndFetchMethod {
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(this: QB, update: PartialModelObject<M>): SingleQueryBuilder<QB>;
  }

  interface UpdateAndFetchByIdMethod {
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(this: QB, id: MaybeCompositeId, update: PartialModelObject<M>): SingleQueryBuilder<QB>;
  }

  interface DeleteMethod {
    <QB extends AnyQueryBuilder>(this: QB): NumberQueryBuilder<QB>;
  }

  interface DeleteByIdMethod {
    <QB extends AnyQueryBuilder>(this: QB, id: MaybeCompositeId): NumberQueryBuilder<QB>;
  }

  interface InsertMethod {
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(this: QB, insert: PartialModelObject<M>): SingleQueryBuilder<QB>;
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(this: QB, insert: PartialModelObject<M>[]): ArrayQueryBuilder<QB>;
  }

  interface EagerMethod {
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(this: QB, expr: RelationExpression<M>, modifiers?: Modifiers): QB;
  }

  interface AllowGraphMethod {
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(this: QB, expr: RelationExpression<M>): QB;
  }

  interface IdentityMethod {
    <QB extends AnyQueryBuilder>(this: QB): QB;
  }

  interface OneArgMethod<T> {
    <QB extends AnyQueryBuilder>(this: QB, arg: T): QB;
  }

  interface StringReturningMethod {
    <QB extends AnyQueryBuilder>(this: QB): string;
  }

  interface BooleanReturningMethod {
    <QB extends AnyQueryBuilder>(this: QB): boolean;
  }

  interface TableRefForMethod {
    <QB extends AnyQueryBuilder>(this: QB, modelClass: typeof Model): string;
  }

  interface ModelClassMethod {
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(this: QB): M;
  }

  interface ReturningMethod {
    <QB extends AnyQueryBuilder>(this: QB, column: string | string[]): QB extends ArrayQueryBuilder<
      QB
    >
      ? ArrayQueryBuilder<QB>
      : QB extends NumberQueryBuilder<QB>
      ? ArrayQueryBuilder<QB>
      : SingleQueryBuilder<QB>;
  }

  export interface Page<M extends Model> {
    total: number;
    results: M[];
  }

  interface PageMethod {
    <QB extends AnyQueryBuilder>(this: QB, page: number, pageSize: number): PageQueryBuilder<QB>;
  }

  interface RangeMethod {
    <QB extends AnyQueryBuilder>(this: QB): PageQueryBuilder<QB>;
    <QB extends AnyQueryBuilder>(this: QB, start: number, end: number): PageQueryBuilder<QB>;
  }

  interface RunBeforeCallback {
    <QB extends AnyQueryBuilder>(this: QB, result: any, query: QB): any;
  }

  interface RunBeforeMethod {
    <QB extends AnyQueryBuilder>(this: QB, cb: RunBeforeCallback): QB;
  }

  interface RunAfterCallback {
    <QB extends AnyQueryBuilder>(this: QB, result: ResultType<QB>, query: QB): any;
  }

  interface RunAfterMethod {
    <QB extends AnyQueryBuilder>(this: QB, cb: RunAfterCallback): QB;
  }

  interface OnBuildMethod {
    <QB extends AnyQueryBuilder>(this: QB, cb: CallbackVoid<QB>): QB;
  }

  interface OnBuildKnexCallback {
    <QB extends AnyQueryBuilder>(this: QB, knexQuery: knex.QueryBuilder, query: QB): void;
  }

  interface OnBuildKnexMethod {
    <QB extends AnyQueryBuilder>(this: QB, cb: OnBuildKnexCallback): QB;
  }

  interface OnErrorCallback {
    <QB extends AnyQueryBuilder>(this: QB, error: Error, query: QB): any;
  }

  interface OnErrorMethod {
    <QB extends AnyQueryBuilder>(this: QB, cb: OnErrorCallback): QB;
  }

  export interface InsertGraphOptions {
    relate?: boolean | string[];
  }

  interface InsertGraphMethod {
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(
      this: QB,
      graph: PartialModelGraph<M>,
      options?: InsertGraphOptions
    ): SingleQueryBuilder<QB>;

    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(
      this: QB,
      graph: PartialModelGraph<M>[],
      options?: InsertGraphOptions
    ): ArrayQueryBuilder<QB>;
  }

  export interface UpsertGraphOptions {
    relate?: boolean | string[];
    unrelate?: boolean | string[];
    insertMissing?: boolean | string[];
    update?: boolean | string[];
    noInsert?: boolean | string[];
    noUpdate?: boolean | string[];
    noDelete?: boolean | string[];
    noRelate?: boolean | string[];
    noUnrelate?: boolean | string[];
  }

  interface UpsertGraphMethod {
    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(
      this: QB,
      graph: PartialModelGraph<M>,
      options?: UpsertGraphOptions
    ): SingleQueryBuilder<QB>;

    <QB extends AnyQueryBuilder, M extends ModelType<QB>>(
      this: QB,
      graph: PartialModelGraph<M>[],
      options?: UpsertGraphOptions
    ): ArrayQueryBuilder<QB>;
  }

  export interface EagerAlgorithm {}

  interface EagerAlgorithmMethod {
    <QB extends AnyQueryBuilder>(this: QB, algorithm: EagerAlgorithm): QB;
  }

  export interface EagerOptions {
    minimize?: boolean;
    separator?: string;
    aliases?: string[];
    joinOperation: string;
  }

  interface EagerOptionsMethod {
    <QB extends AnyQueryBuilder>(this: QB, options: EagerOptions): QB;
  }

  interface ModifyEagerMethod {
    <M extends ModelType<QB>, QB extends AnyQueryBuilder>(this: QB, expr: RelationExpression<M>, modifier: Modifier<M['QueryBuilderType']>): QB;
  }

  interface ContextMethod {
    <QB extends AnyQueryBuilder>(this: QB, context: object): QB;
    <QB extends AnyQueryBuilder>(this: QB): QueryContext;
  }

  export interface Pojo {
    [key: string]: any;
  }

  export class QueryBuilder<M extends Model, R = M[]> extends Promise<R> {
    static forClass: ForClassMethod;

    select: SelectMethod;
    columns: SelectMethod;
    column: SelectMethod;
    distinct: SelectMethod;

    from: FromMethod;
    table: FromMethod;
    into: FromMethod;

    where: WhereMethod<'Array'>;
    andWhere: WhereMethod<'Array'>;
    orWhere: WhereMethod<'Array'>;
    whereNot: WhereMethod<'Array'>;
    andWhereNot: WhereMethod<'Array'>;
    orWhereNot: WhereMethod<'Array'>;

    whereRaw: RawInterface<this>;
    orWhereRaw: RawInterface<this>;
    andWhereRaw: RawInterface<this>;

    whereWrapped: WhereWrappedMethod;
    havingWrapped: WhereWrappedMethod;

    whereExists: WhereExistsMethod;
    orWhereExists: WhereExistsMethod;
    whereNotExists: WhereExistsMethod;
    orWhereNotExists: WhereExistsMethod;

    whereIn: WhereInMethod;
    orWhereIn: WhereInMethod;
    whereNotIn: WhereInMethod;
    orWhereNotIn: WhereInMethod;

    union: UnionMethod;
    unionAll: UnionMethod;

    joinRelation: JoinRelationMethod;
    innerJoinRelation: JoinRelationMethod;
    outerJoinRelation: JoinRelationMethod;
    leftJoinRelation: JoinRelationMethod;
    leftOuterJoinRelation: JoinRelationMethod;
    rightJoinRelation: JoinRelationMethod;
    rightOuterJoinRelation: JoinRelationMethod;
    fullOuterJoinRelation: JoinRelationMethod;

    join: JoinMethod;
    joinRaw: RawInterface<this>;
    innerJoin: JoinMethod;
    leftJoin: JoinMethod;
    leftOuterJoin: JoinMethod;
    rightJoin: JoinMethod;
    rightOuterJoin: JoinMethod;
    outerJoin: JoinMethod;
    fullOuterJoin: JoinMethod;
    crossJoin: JoinMethod;

    increment: IncrementDecrementMethod;
    decrement: IncrementDecrementMethod;

    findById: FindByIdMethod;
    findByIds: FindByIdsMethod;
    findOne: WhereMethod<'Single'>;

    first: FirstMethod;

    orderBy: OrderByMethod;
    orderByRaw: RawInterface<this>;

    castTo: CastToMethod;

    update: UpdateMethod;
    updateAndFetch: UpdateAndFetchMethod;
    updateAndFetchById: UpdateAndFetchByIdMethod;

    patch: UpdateMethod;
    patchAndFetch: UpdateAndFetchMethod;
    patchAndFetchById: UpdateAndFetchByIdMethod;

    del: DeleteMethod;
    delete: DeleteMethod;
    deleteById: DeleteByIdMethod;

    insert: InsertMethod;
    insertAndFetch: InsertMethod;

    eager: EagerMethod;
    mergeEager: EagerMethod;

    joinEager: EagerMethod;
    mergeJoinEager: EagerMethod;

    naiveEager: EagerMethod;
    mergeNaiveEager: EagerMethod;

    allowEager: AllowGraphMethod;
    mergeAllowEager: AllowGraphMethod;

    allowInsert: AllowGraphMethod;
    allowUpsert: AllowGraphMethod;

    throwIfNotFound: IdentityMethod;
    returning: ReturningMethod;
    forUpdate: IdentityMethod;
    skipUndefined: IdentityMethod;
    debug: IdentityMethod;
    as: OneArgMethod<string>;
    alias: OneArgMethod<string>;
    withSchema: OneArgMethod<string>;
    modelClass: ModelClassMethod
    tableNameFor: TableRefForMethod;
    tableRefFor: TableRefForMethod;
    toSql: StringReturningMethod;
    reject: OneArgMethod<any>;
    resolve: OneArgMethod<any>;

    page: PageMethod;
    range: RangeMethod;

    runBefore: RunBeforeMethod;
    runAfter: RunAfterMethod;

    onBuild: OnBuildMethod;
    onBuildKnex: OnBuildKnexMethod;
    onError: OnErrorMethod;

    insertGraph: InsertGraphMethod;
    insertGraphAndFetch: InsertGraphMethod;
    insertWithRelated: InsertGraphMethod;
    insertWithRelatedAndFetch: InsertGraphMethod;

    upsertGraph: UpsertGraphMethod;
    upsertGraphAndFetch: UpsertGraphMethod;

    eagerAlgorithm: EagerAlgorithmMethod;
    eagerOptions: EagerOptionsMethod;
    modifyEager: ModifyEagerMethod;

    context: ContextMethod;
    mergeContext: ContextMethod;

    isFind: BooleanReturningMethod;
    isInsert: BooleanReturningMethod;
    isUpdate: BooleanReturningMethod;
    isDelete: BooleanReturningMethod;
    isRelate: BooleanReturningMethod;
    isUnrelate: BooleanReturningMethod;
    hasWheres: BooleanReturningMethod;
    hasSelects: BooleanReturningMethod;
    hasEager: BooleanReturningMethod;

    ModelType: M;
    ResultType: R;

    execute: Promise<R>;

    ArrayQueryBuilderType: QueryBuilder<M, M[]>;
    SingleQueryBuilderType: QueryBuilder<M, M>;
    NumberQueryBuilderType: QueryBuilder<M, number>;
    PageQueryBuilderType: QueryBuilder<M, Page<M>>;
  }

  interface StaticQueryMethod {
    <M extends typeof Model>(this: M, trxOrKnex?: Transaction | knex): InstanceType<M>['QueryBuilderType'];
  }

  interface QueryMethod {
    <M extends Model>(this: M, trxOrKnex?: Transaction | knex): SingleQueryBuilder<
      M['QueryBuilderType']
    >;
  }

  type RelatedQueryBuilder<T> = T extends Model
    ? SingleQueryBuilder<T['QueryBuilderType']>
    : T extends Array<infer I>
    ? (I extends Model ? I['QueryBuilderType'] : never)
    : never;

  interface RelatedQueryMethod {
    <K extends keyof M, M extends Model>(this: M, relationName: K, trxOrKnex?: Transaction | knex): RelatedQueryBuilder<M[K]>;
    <M extends Model>(
      relationName: string,
      trxOrKnex?: Transaction | knex
    ): M['QueryBuilderType'];
  }

  interface LoadRelatedMethod {
    <M extends Model>(
      this: M,
      expression: RelationExpression<M>,
      modifiers?: Modifiers<M['QueryBuilderType']>,
      trxOrKnex?: Transaction | knex
    ): SingleQueryBuilder<M['QueryBuilderType']>;
  }

  interface StaticLoadRelatedMethod {
    <SM extends typeof Model, M extends InstanceType<SM>>(
      this: SM,
      modelOrObject: PartialModelObject<M>,
      expression: RelationExpression<M>,
      modifiers?: Modifiers<M['QueryBuilderType']>,
      trxOrKnex?: Transaction | knex
    ): SingleQueryBuilder<M['QueryBuilderType']>;

    <SM extends typeof Model, M extends InstanceType<SM>>(
      this: SM,
      modelOrObject: PartialModelObject<M>[],
      expression: RelationExpression<M>,
      modifiers?: Modifiers<M['QueryBuilderType']>,
      trxOrKnex?: Transaction | knex
    ): M['QueryBuilderType'];
  }

  interface IdMethod {
    <M extends Model>(this: M, id: any): void;
    <M extends Model>(this: M): any;
  }

  export interface Transaction extends knex {
    savepoint(transactionScope: (trx: Transaction) => any): Promise<any>;
    commit<QM>(value?: any): Promise<QM>;
    rollback<QM>(error?: Error): Promise<QM>;
  }

  export interface RelationMappings {
    [relationName: string]: RelationMapping;
  }

  type ModelClassFactory = () => typeof Model;
  type ModelClassSpecifier = ModelClassFactory | typeof Model | string;
  type RelationMappingHook = (model: typeof Model, context: QueryContext) => Promise<void> | void;
  type RelationMappingColumnRef = string | ReferenceBuilder | (string | ReferenceBuilder)[];

  export interface RelationMapping<M extends typeof Model = typeof Model> {
    relation: Relation;
    modelClass: ModelClassSpecifier;
    join: RelationJoin;
    modify?: Modifier<InstanceType<M>['QueryBuilderType']>;
    filter?: Modifier<InstanceType<M>['QueryBuilderType']>;
    beforeInsert?: RelationMappingHook;
  }

  export interface RelationJoin {
    from: RelationMappingColumnRef;
    to: RelationMappingColumnRef;
    through?: RelationThrough;
  }

  export interface RelationThrough {
    from: RelationMappingColumnRef;
    to: RelationMappingColumnRef;
    extra?: string[] | object;
    modelClass?: ModelClassSpecifier;
    beforeInsert?: RelationMappingHook;
  }

  export interface Relation {}

  export interface QueryContext {
    transaction: Transaction;
    [key: string]: any;
  }

  export interface ModelOptions {
    patch?: boolean;
    skipValidation?: boolean;
    old?: object;
  }

  export interface CloneOptions {
    shallow?: boolean;
  }

  export interface ToJsonOptions extends CloneOptions {
    virtuals?: boolean | string[];
  }

  export interface ValidatorContext {
    [key: string]: any;
  }

  export interface ValidatorArgs {
    ctx: ValidatorContext;
    model: typeof Model;
    json: Pojo;
    options: ModelOptions;
  }

  export class Validator {
    beforeValidate(args: ValidatorArgs): void;
    validate(args: ValidatorArgs): Pojo;
    afterValidate(args: ValidatorArgs): void;
  }

  export interface AjvConfig {
    onCreateAjv(ajv: ajv.Ajv): void;
    options?: ajv.Options;
  }

  export class AjvValidator extends Validator {
    constructor(config: AjvConfig);
  }

  export interface SnakeCaseMappersOptions {
    upperCase?: boolean;
    underscoreBeforeDigits?: boolean;
  }

  export interface ColumnNameMappers {
    parse(json: Pojo): Pojo;
    format(json: Pojo): Pojo;
  }

  export interface SnakeCaseMappersFactory {
    (options?: SnakeCaseMappersOptions): ColumnNameMappers;
  }

  export interface KnexMappers {
    wrapIdentifier(identifier: string, origWrap: Identity<string>): string;
    postProcessResponse(response: any): any;
  }

  export interface KnexSnakeCaseMappersFactory {
    (options?: SnakeCaseMappersOptions): KnexMappers;
  }

  export type ValidationErrorType =
    | 'ModelValidation'
    | 'RelationExpression'
    | 'UnallowedRelation'
    | 'InvalidGraph';

  export class ValidationError extends Error {
    constructor(args: CreateValidationErrorArgs);

    statusCode: number;
    message: string;
    data?: ErrorHash | any;
    type: ValidationErrorType;
  }

  export interface ValidationErrorItem {
    message: string;
    keyword: string;
    params: Pojo;
  }

  export interface ErrorHash {
    [columnName: string]: ValidationErrorItem[];
  }

  export interface CreateValidationErrorArgs {
    message?: string;
    data?: ErrorHash | any;
    // This can be any string for custom errors. ValidationErrorType is there
    // only to document the default values objection uses internally.
    type: ValidationErrorType | string;
  }

  export interface TableMetadata {
    columns: Array<string>;
  }

  export interface TableMetadataOptions {
    table: string;
  }

  export interface FetchTableMetadataOptions {
    knex?: knex;
    force?: boolean;
    table?: string;
  }

  interface BindKnexMethod {
    <SM extends typeof Model>(this: SM, trxOrKnex: Transaction | knex): SM;
  }

  interface FromJsonMethod {
    <SM extends typeof Model>(this: SM, json: object): SM;
  }

  export class Model {
    static tableName: string;
    static idColumn: string | string[];

    static BelongsToOneRelation: Relation;
    static HasOneRelation: Relation;
    static HasManyRelation: Relation;
    static ManyToManyRelation: Relation;
    static HasOneThroughRelation: Relation;

    static WhereInEagerAlgorithm: EagerAlgorithm;
    static NaiveEagerAlgorithm: EagerAlgorithm;
    static JoinEagerAlgorithm: EagerAlgorithm;

    static query: StaticQueryMethod;
    static columnNameMappers: ColumnNameMappers;
    static relationMappings: RelationMappings | (() => RelationMappings);

    static fromJson: FromJsonMethod;
    static fromDatabaseJson: FromJsonMethod;

    static createValidationError(args: CreateValidationErrorArgs): Error;
    static tableMetadata(opt?: TableMetadataOptions): TableMetadata;
    static fetchTableMetadata(opt?: FetchTableMetadataOptions): Promise<TableMetadata>;

    static bindKnex: BindKnexMethod;
    static bindTransaction: BindKnexMethod;
    static loadRelated: StaticLoadRelatedMethod;
    static raw: RawFunction;

    static QueryBuilder: typeof QueryBuilder;

    QueryBuilderType: QueryBuilder<this>;


    $query: QueryMethod;
    $relatedQuery: RelatedQueryMethod;
    $id: IdMethod;
    $loadRelated: LoadRelatedMethod;

    $formatDatabaseJson<M extends Model>(this: M, json: Pojo): Pojo;
    $parseDatabaseJson<M extends Model>(this: M, json: Pojo): Pojo;

    $formatJson<M extends Model>(this: M, json: Pojo): Pojo;
    $parseJson<M extends Model>(this: M, json: Pojo, opt?: ModelOptions): Pojo;

    $toDatabaseJson<M extends Model>(this: M): Pojo;
    $toJson<M extends Model>(this: M, opt?: ToJsonOptions): Pojo;
    toJSON<M extends Model>(this: M, opt?: ToJsonOptions): Pojo;

    $setJson<M extends Model>(this: M, json: object, opt?: ModelOptions): M;
    $setDatabaseJson<M extends Model>(this: M, json: object): M;

    $setRelated<M extends Model, RM extends typeof Model>(
      this: M,
      relation: String | Relation,
      related: RM | RM[] | null | undefined
    ): M;

    $appendRelated<M extends Model, RM extends typeof Model>(
      this: M,
      relation: String | Relation,
      related: RM | RM[] | null | undefined
    ): M;

    $set<M extends Model>(this: M, obj: Pojo): M;
    $omit<M extends Model>(this: M, keys: string | string[] | { [key: string]: boolean }): M;
    $pick<M extends Model>(this: M, keys: string | string[] | { [key: string]: boolean }): M;
    $clone<M extends Model>(this: M, opt?: CloneOptions): M;
  }
}
