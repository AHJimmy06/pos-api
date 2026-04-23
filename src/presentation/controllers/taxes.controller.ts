import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTaxDto } from '../taxes/dto/create-tax.dto';
import { UpdateTaxDto } from '../taxes/dto/update-tax.dto';
import { CreateTaxCommand } from '../../application/taxes/commands/create-tax.command';
import { UpdateTaxCommand } from '../../application/taxes/commands/update-tax.command';
import { DeleteTaxCommand } from '../../application/taxes/commands/delete-tax.command';
import { GetTaxesQuery } from '../../application/taxes/queries/get-taxes.query';
import { GetTaxQuery } from '../../application/taxes/queries/get-tax.query';
import { Tax } from '../../domain/taxes/entities/tax.entity';

@ApiTags('taxes')
@Controller('taxes')
export class TaxesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tax' })
  @ApiResponse({
    status: 201,
    description: 'The tax has been successfully created.',
  })
  async create(@Body() createTaxDto: CreateTaxDto): Promise<Tax> {
    return this.commandBus.execute(
      new CreateTaxCommand(createTaxDto.name, createTaxDto.currentRate),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all taxes' })
  async findAll(): Promise<Tax[]> {
    return this.queryBus.execute(new GetTaxesQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tax by id' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Tax> {
    return this.queryBus.execute(new GetTaxQuery(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tax' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaxDto: UpdateTaxDto,
  ): Promise<Tax> {
    return this.commandBus.execute(new UpdateTaxCommand(id, updateTaxDto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tax' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commandBus.execute(new DeleteTaxCommand(id));
  }
}
