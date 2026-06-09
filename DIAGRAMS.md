# Backend Architecture Diagrams (POS API)

## Layered Architecture (Hexagonal/Clean)
Muestra la separación de responsabilidades y el flujo de dependencias hacia el dominio.

```mermaid
graph TD
    subgraph Infrastructure
        Controller[Controllers / Web]
        Repo[Prisma Repositories]
        Filters[Global Filters / Interceptors]
    end

    subgraph Application
        Commands[Commands / Handlers]
        DTOs[Data Transfer Objects]
    end

    subgraph Domain
        Entities[Entities]
        Interfaces[Repository Interfaces]
        VOs[Value Objects]
    end

    Controller --> Commands
    Commands --> Entities
    Commands --> Interfaces
    Repo -- implements --> Interfaces
    Repo --> Entities
```

## Data Domain Model
Diagrama de clases para las entidades persistidas y sus relaciones.

```mermaid
classDiagram
    class User {
        +Int id
        +String username
        +String email
        +String password
        +UserRole role
        +Boolean isActive
    }

    class Client {
        +Int id
        +String firstName
        +String lastName
        +String cedula
        +String email
    }

    class Product {
        +Int id
        +String name
        +Float price
        +Int stock
        +Boolean isActive
    }

    class Invoice {
        +Int id
        +String number
        +DateTime date
        +Float subtotal
        +Float taxTotal
        +Float total
    }

    class InvoiceDetail {
        +Int id
        +Int quantity
        +Float unitPrice
        +Float subtotal
    }

    Invoice "many" o-- "1" User : seller
    Invoice "many" o-- "1" Client : customer
    Invoice "1" *-- "many" InvoiceDetail : composition
    InvoiceDetail "many" o-- "1" Product : item
```

## Security Flow (Authentication)
Flujo de registro y login con bloqueo automático.

```mermaid
sequenceDiagram
    participant User as Cliente/Admin
    participant Auth as AuthController
    participant Service as AuthService
    participant DB as Prisma/Database

    User->>Auth: POST /auth/register
    Auth->>DB: Check uniqueness
    Auth->>DB: Create User (hashed pass)
    
    User->>Auth: POST /auth/login
    Auth->>Service: Validate credentials
    alt Valid
        Service-->>User: JWT Token
    else Invalid (3 times)
        Service->>DB: Block User Account
        Service-->>User: 401 Unauthorized (Blocked)
    end
```
