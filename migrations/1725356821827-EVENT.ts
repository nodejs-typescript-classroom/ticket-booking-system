import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class EVENT1725356821827 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        schema: 'public',
        name: 'events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'timestamp without time zone',
            isNullable: false,
          },
          {
            name: 'number_of_days',
            type: 'bigint',
            default: 1,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp without time zone',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp without time zone',
            isNullable: false,
            default: 'now()',
          }
        ],
        uniques: [{
          name: 'unique_event_condition',
          columnNames: ['name', 'location', 'start_date'],
        }]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('public.events', true, true, true);
  }

}
