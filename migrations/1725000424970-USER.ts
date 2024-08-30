import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class USER1725000424970 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        schema: 'public',
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '200',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '60',
            isNullable: false,
            default: "'attendee'"
          },
          {
            name: 'refresh_token',
            type: 'varchar',
            length: '500',
            isNullable: true,
            default: null,
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
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('public.users', true, true, true);
  }

}
