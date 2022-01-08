import { Injectable } from "@nestjs/common";

import { InfoEntity } from "../common/entities/info.entity";
import { InjectRepository, QueryRunner, Connection } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClientInfoEntity } from "./entities/client-info.entity";
import { ClientInfoDto, ClientInfoOutput } from "./dto/client-info.dto";
import { InfoDto } from "src/common/dto/info.dto";
import { JwtService } from "src/jwt/jwt.service";
import { BaseInfoEntity } from "./entities/base-info.entity";
import { MailService } from "src/mail/mail.service";

const infoNameArray = ["clientInfo", "baseInfo"];

@Injectable()
export class InfoService {
  constructor(
    private connection: Connection,
    @InjectRepository(InfoEntity) private readonly info: Repository<InfoEntity>,
    @InjectRepository(ClientInfoEntity)
    private readonly clientInfo: Repository<ClientInfoEntity>,
    @InjectRepository(BaseInfoEntity)
    private readonly baseInfo: Repository<BaseInfoEntity>,
    private readonly jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async getUser(clientEmail: string) {
    const user = await this.info.findOne(clientEmail, {
      relations: ["clientInfo", "baseInfo"],
    });

    return user;
  }

  async findById(id: string): Promise<InfoDto> {
    return await this.info.findOne({ id });
  }

  async saveInfo(infoData: InfoDto, id: string): Promise<ClientInfoOutput> {
    try {
      const { clientInfo } = infoData;

      const exists = await this.info.findOne(
        { id },
        { relations: [...infoNameArray] },
      );

      if (exists) {
        console.log(infoData);
        const { clientInfo, baseInfo } = infoData;
        const infoName = infoNameArray[0]; //0 will be status

        await this[infoData.status].save({
          ...exists.clientInfo,
          ...clientInfo,
        });

        await this.info.save(exists);

        // const token = this.jwtService.sign({ id: exists.id });
        // return { token };
      } else {
        return { error: "오류" };
      }
    } catch (error) {
      return { error };
    }
  }

  async createInfo(infoData: InfoDto): Promise<ClientInfoOutput> {
    try {
      const exists = await this.info.findOne(
        { clientEmail: infoData.clientEmail },
        // { relations: [...infoNameArray] },
      );

      if (exists) {
        const token = this.jwtService.sign({ id: exists.id });
        return { token, error: "존재하는 이메일" };
      }

      const { clientInfo, baseInfo, detailInfo, password } = infoData;

      const crateClientInfo = await this.clientInfo.save(
        this.clientInfo.create(clientInfo),
      );
      // const queryRunner = this.connection.createQueryRunner();

      // await queryRunner.connect();
      // await queryRunner.startTransaction();
      // const crateBaseInfo =
      //   baseInfo && (await this.baseInfo.save(this.baseInfo.create(baseInfo)));

      const newInfoData = await this.info.save(
        this.info.create({
          clientEmail: clientInfo.clientEmail,
          password,
          clientInfo: crateClientInfo,
          // baseInfo: crateBaseInfo,
        }),
      );
      const token = this.jwtService.sign({ id: newInfoData.id });

      await this.mailService.sendToClient();

      return { token };
    } catch (error) {
      return { error };
    }
  }

  async uploadFile() {}

  async saveInfoInDetailPage() {
    await console.log(32223);
  }
}
