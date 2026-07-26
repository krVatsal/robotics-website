# Illustrator MCP Integration

This project integrates the Model Context Protocol (MCP) with Adobe Illustrator, allowing users to control Illustrator through natural language prompts. This enhances the graphic design workflow by enabling intuitive commands and interactions with the software.

## Features

- **Natural Language Processing**: Interpret user prompts to execute commands in Illustrator.
- **Context Management**: Maintain the state and context of the current Illustrator session.
- **Command Handlers**: Define and manage various commands that can be executed based on user input.
- **Logging and Validation**: Ensure commands are logged and validated before execution.

## Project Structure

- `src/`: Contains the source code for the integration.
  - `core/`: Core functionalities including MCP context and handlers.
    - `mcp/`: Implementation of the Model Context Protocol.
    - `illustrator/`: Commands and connection management for Illustrator.
    - `utils/`: Utility functions such as logging and validation.
  - `handlers/`: Specific handlers for different Illustrator functionalities like documents, layers, and tools.
  - `prompts/`: Strategies for handling user prompts.
  - `types/`: Type definitions for commands, configurations, and responses.
  - `config.ts`: Configuration settings for the integration.
  - `index.ts`: Entry point for the application.
  
- `tests/`: Contains unit tests for the core functionalities, handlers, and utilities.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd illustrator-mcp
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

To start the integration, run the following command:
```
npm start
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.