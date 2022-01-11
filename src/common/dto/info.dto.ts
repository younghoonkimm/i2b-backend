import { IsString, IsNumber, IsOptional, Length } from "class-validator";
import { PickType, ApiProperty } from "@nestjs/swagger";
import { Column } from "typeorm";
import { InfoEntity } from "../entities/info.entity";

export class InfoDto extends PickType(InfoEntity, [
  "clientInfo",
  "baseInfo",
  "detailInfo",
  "status",
]) {
  @ApiProperty({
    example: "dev.olivestonelab.com",
  })
  clientEmail?: string;

  @ApiProperty({
    example: "olivestonlab##",
  })
  password?: string;
}
