import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786224154223 implements MigrationInterface {
    name = 'InitialSchema1786224154223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`states\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`uf\` char(2) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, INDEX \`idx_states_uf\` (\`uf\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`state_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, INDEX \`idx_cities_state_name\` (\`state_id\`, \`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cities\` ADD CONSTRAINT \`fk_cities_state\` FOREIGN KEY (\`state_id\`) REFERENCES \`states\`(\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cities\` DROP FOREIGN KEY \`fk_cities_state\``);
        await queryRunner.query(`DROP INDEX \`idx_cities_state_name\` ON \`cities\``);
        await queryRunner.query(`DROP TABLE \`cities\``);
        await queryRunner.query(`DROP INDEX \`idx_states_uf\` ON \`states\``);
        await queryRunner.query(`DROP TABLE \`states\``);
    }

}
