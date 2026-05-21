import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateClientDto } from '../clients/dto/create-client.dto';
import { UpdateClientDto } from '../clients/dto/update-client.dto';
import { CreateClientCommand } from '../../application/clients/commands/create-client.command';
import { UpdateClientCommand } from '../../application/clients/commands/update-client.command';
import { DeleteClientCommand } from '../../application/clients/commands/delete-client.command';
import { GetClientsQuery } from '../../application/clients/queries/get-clients.query';
import { GetClientQuery } from '../../application/clients/queries/get-client.query';
import { Client } from '../../domain/entities/client.entity';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { UserRole } from '../../domain/enums/user-role.enum';

@ApiTags('clients')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: 201,
    description: 'The client has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Business rule violation (e.g. invalid data or duplicate client).',
  })
  async create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.commandBus.execute(
      new CreateClientCommand(
        createClientDto.firstName,
        createClientDto.lastName,
        createClientDto.phone,
        createClientDto.address,
        createClientDto.email,
      ),
    );
  }

  @Get()
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({ summary: 'Get all clients' })
  async findAll(): Promise<Client[]> {
    return this.queryBus.execute(new GetClientsQuery());
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({ summary: 'Get a client by id' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Client> {
    return this.queryBus.execute(new GetClientQuery(id));
  }

  @Put(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Update a client' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    return this.commandBus.execute(
      new UpdateClientCommand(id, updateClientDto),
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Delete a client' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commandBus.execute(new DeleteClientCommand(id));
  }
}

