import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class TICKET1726456107308 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        schema: 'public',
        name: 'tickets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'event_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'entered',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'ticket_number',
            type: 'bigint',
            isNullable: false,
            default: 1,
          },
          {
            name: 'created_at',
            type: 'timestamp without time zone',
            isNullable: false,
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp without time zone',
            isNullable: false,
            default: 'now()'
          }
        ],
        foreignKeys: [
          {
            name: 'event_id_reference',
            columnNames: ['event_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'public.events',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          },
          {
            name: 'user_id_reference',
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'public.users',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('public.tickets', true, true, true);
  }
}
