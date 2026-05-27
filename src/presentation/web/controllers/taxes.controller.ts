import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateTaxDto } from '../../taxes/dto/create-tax.dto';
import { UpdateTaxDto } from '../../taxes/dto/update-tax.dto';
import { CreateTaxCommand } from '../../../application/taxes/create-tax.command';
import { UpdateTaxCommand } from '../../../application/taxes/update-tax.command';
import { DeleteTaxCommand } from '../../../application/taxes/delete-tax.command';
import { GetTaxesQuery } from '../../../application/taxes/get-taxes.query';
import { GetTaxQuery } from '../../../application/taxes/get-tax.query';
import { Tax } from '../../../domain/entities/tax.entity';
import { JwtAuthGuard } from '../../../infrastructure/security/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../../infrastructure/security/decorators/roles.decorator';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { normalizePageSize } from '../../infrastructure/common/utils/page-size.util';

@ApiTags('taxes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('taxes')
export class TaxesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Create a new tax' })
  @ApiResponse({
    status: 201,
    description: 'The tax has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Business rule violation.' })
  async create(@Body() createTaxDto: CreateTaxDto): Promise<Tax> {
    return this.commandBus.execute(
      new CreateTaxCommand(createTaxDto.name, createTaxDto.currentRate),
    );
  }

  @Get()
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({ summary: 'Get all taxes (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<{ data: Tax[]; total: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = normalizePageSize(limit);
    return this.queryBus.execute(
      new GetTaxesQuery(pageNum, limitNum, search),
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({ summary: 'Get a tax by id' })
  @ApiResponse({ status: 404, description: 'Tax not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Tax> {
    return this.queryBus.execute(new GetTaxQuery(id));
  }

  @Put(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Update a tax' })
  @ApiResponse({ status: 200, description: 'Tax updated successfully.' })
  @ApiResponse({ status: 400, description: 'Business rule violation.' })
  @ApiResponse({ status: 404, description: 'Tax not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaxDto: UpdateTaxDto,
  ): Promise<Tax> {
    return this.commandBus.execute(new UpdateTaxCommand(id, updateTaxDto));
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Delete a tax' })
  @ApiResponse({ status: 204, description: 'Tax deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Tax not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commandBus.execute(new DeleteTaxCommand(id));
  }
}
