import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
export class ADDADMIN1725112383651 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const id = crypto.randomUUID();
    const email = process.env.ADMIN_USER;
    const password = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(password, 10);
    await queryRunner.query(`
      INSERT INTO users(id, email, password, role)
      VALUES($1, $2, $3, 'admin');  
    `, [id, email, hashedPassword]); 
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.ADMIN_USER;
    await queryRunner.query(`
      DELETE FROM users
      WHERE users.email=$1;
    `, [email]);
  }
}
