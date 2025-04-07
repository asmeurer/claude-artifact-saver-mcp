#!/usr/bin/env python3
import os
import json
import uuid
import sys
import logging
import traceback
from datetime import datetime
from typing import Optional, Dict, Any

# Print startup message to stderr immediately for debugging
print("Artifact Saver starting up...", file=sys.stderr)

try:
    from mcp.server.fastmcp import FastMCP
    print("Successfully imported FastMCP", file=sys.stderr)
except Exception as e:
    print(f"ERROR importing FastMCP: {e}", file=sys.stderr)
    print(f"Python path: {sys.path}", file=sys.stderr)
    print(f"Python version: {sys.version}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)

# Configure logging to stderr
logging.basicConfig(
    stream=sys.stderr,
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('artifact-saver')

# Log Python version and environment info
logger.info(f"Python version: {sys.version}")
logger.info(f"Running in directory: {os.getcwd()}")
logger.info(f"Sys path: {sys.path}")

# Initialize FastMCP server
try:
    logger.info("Initializing FastMCP server")
    mcp = FastMCP("artifact-saver")
    logger.info("FastMCP server initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize FastMCP server: {str(e)}")
    logger.error(traceback.format_exc())
    sys.exit(1)

# Global state
SAVE_DIRECTORY = os.path.expanduser("~/claude_artifacts")
logger.info(f"Default save directory set to: {SAVE_DIRECTORY}")

@mcp.tool()
async def set_save_directory(directory_path: str) -> str:
    """Set the directory where artifacts will be saved.

    Args:
        directory_path: Absolute or relative path to the directory where artifacts should be saved

    Returns:
        Confirmation message with the absolute path that was set
    """
    logger.info(f"set_save_directory called with path: {directory_path}")
    global SAVE_DIRECTORY

    try:
        # Expand user directory if needed (e.g., ~/artifacts becomes /home/username/artifacts)
        expanded_path = os.path.expanduser(directory_path)
        logger.debug(f"Expanded path: {expanded_path}")

        # Convert to absolute path if it's relative
        absolute_path = os.path.abspath(expanded_path)
        logger.debug(f"Absolute path: {absolute_path}")

        # Create the directory if it doesn't exist
        if not os.path.exists(absolute_path):
            logger.info(f"Directory does not exist, creating: {absolute_path}")
            try:
                os.makedirs(absolute_path, exist_ok=True)
                logger.info(f"Directory created successfully: {absolute_path}")
            except Exception as e:
                error_msg = f"Error creating directory: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                return error_msg

        # Set the global save directory
        logger.info(f"Setting save directory from {SAVE_DIRECTORY} to {absolute_path}")
        SAVE_DIRECTORY = absolute_path

        return f"Save directory set to: {SAVE_DIRECTORY}"
    except Exception as e:
        error_msg = f"Unexpected error in set_save_directory: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        return error_msg

@mcp.tool()
async def save_artifact(content: str, file_name: Optional[str] = None, file_type: str = "txt") -> str:
    """Save artifact content to a file in the configured directory.

    Args:
        content: The content of the artifact to save
        file_name: Optional name for the file (without extension)
        file_type: File extension/type (default: txt)

    Returns:
        Path to the saved file or error message
    """
    logger.info(f"save_artifact called with file_name: {file_name}, file_type: {file_type}")
    logger.debug(f"Content length: {len(content)} characters")
    global SAVE_DIRECTORY

    try:
        # Ensure the save directory exists
        logger.debug(f"Checking if save directory exists: {SAVE_DIRECTORY}")
        if not os.path.exists(SAVE_DIRECTORY):
            logger.info(f"Save directory does not exist, creating: {SAVE_DIRECTORY}")
            try:
                os.makedirs(SAVE_DIRECTORY, exist_ok=True)
                logger.info(f"Save directory created successfully")
            except Exception as e:
                error_msg = f"Error creating save directory: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                return error_msg

        # Generate filename if not provided
        if not file_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_name = f"artifact_{timestamp}_{str(uuid.uuid4())[:8]}"
            logger.debug(f"Generated filename: {file_name}")

        # Clean the filename to avoid path traversal or invalid characters
        clean_filename = "".join(c for c in file_name if c.isalnum() or c in "._- ")
        if clean_filename != file_name:
            logger.debug(f"Sanitized filename from '{file_name}' to '{clean_filename}'")

        # Clean the file_type (extension)
        clean_file_type = "".join(c for c in file_type if c.isalnum())
        if clean_file_type != file_type:
            logger.debug(f"Sanitized file_type from '{file_type}' to '{clean_file_type}'")

        # Create full file path
        file_path = os.path.join(SAVE_DIRECTORY, f"{clean_filename}.{clean_file_type}")
        logger.info(f"Full file path: {file_path}")

        # Write content to file
        logger.debug(f"Writing content to file: {file_path}")
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            logger.info(f"File written successfully: {file_path}")
            return f"Artifact saved successfully to: {file_path}"
        except Exception as e:
            error_msg = f"Error saving artifact: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            return error_msg
    except Exception as e:
        error_msg = f"Unexpected error in save_artifact: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        return error_msg

@mcp.tool()
async def save_artifact_with_metadata(content: str, metadata: Dict[str, Any],
                                      file_name: Optional[str] = None) -> str:
    """Save artifact content with metadata to a JSON file.

    Args:
        content: The content of the artifact to save
        metadata: Dictionary of metadata to save with the artifact
        file_name: Optional name for the file (without extension)

    Returns:
        Path to the saved file or error message
    """
    logger.info(f"save_artifact_with_metadata called with file_name: {file_name}")
    logger.debug(f"Content length: {len(content)} characters")
    logger.debug(f"Metadata: {metadata}")
    global SAVE_DIRECTORY

    try:
        # Ensure the save directory exists
        logger.debug(f"Checking if save directory exists: {SAVE_DIRECTORY}")
        if not os.path.exists(SAVE_DIRECTORY):
            logger.info(f"Save directory does not exist, creating: {SAVE_DIRECTORY}")
            try:
                os.makedirs(SAVE_DIRECTORY, exist_ok=True)
                logger.info(f"Save directory created successfully")
            except Exception as e:
                error_msg = f"Error creating save directory: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                return error_msg

        # Generate filename if not provided
        if not file_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_name = f"artifact_{timestamp}_{str(uuid.uuid4())[:8]}"
            logger.debug(f"Generated filename: {file_name}")

        # Clean the filename to avoid path traversal or invalid characters
        clean_filename = "".join(c for c in file_name if c.isalnum() or c in "._- ")
        if clean_filename != file_name:
            logger.debug(f"Sanitized filename from '{file_name}' to '{clean_filename}'")

        # Create full file path
        file_path = os.path.join(SAVE_DIRECTORY, f"{clean_filename}.json")
        logger.info(f"Full file path: {file_path}")

        # Prepare the data structure with content and metadata
        data = {
            "content": content,
            "metadata": metadata,
            "saved_at": datetime.now().isoformat()
        }

        # Write to JSON file
        logger.debug(f"Writing JSON data to file: {file_path}")
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f"JSON file written successfully: {file_path}")
            return f"Artifact with metadata saved successfully to: {file_path}"
        except Exception as e:
            error_msg = f"Error saving artifact with metadata: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            return error_msg
    except Exception as e:
        error_msg = f"Unexpected error in save_artifact_with_metadata: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        return error_msg

@mcp.tool()
async def get_save_directory() -> str:
    """Get the current directory where artifacts are being saved.

    Returns:
        The absolute path to the current save directory
    """
    logger.info("get_save_directory called")
    global SAVE_DIRECTORY
    logger.info(f"Current save directory: {SAVE_DIRECTORY}")
    return SAVE_DIRECTORY

@mcp.tool()
async def list_saved_artifacts() -> str:
    """List all artifacts saved in the current save directory.

    Returns:
        A formatted list of saved artifacts or error message
    """
    logger.info("list_saved_artifacts called")
    global SAVE_DIRECTORY

    try:
        # Check if directory exists
        logger.debug(f"Checking if save directory exists: {SAVE_DIRECTORY}")
        if not os.path.exists(SAVE_DIRECTORY):
            logger.warning(f"Save directory does not exist: {SAVE_DIRECTORY}")
            return f"Save directory '{SAVE_DIRECTORY}' does not exist."

        # List files in the directory
        logger.debug(f"Listing files in directory: {SAVE_DIRECTORY}")
        try:
            files = os.listdir(SAVE_DIRECTORY)
            logger.info(f"Found {len(files)} files in directory")

            if not files:
                logger.info("No artifacts found in directory")
                return f"No artifacts found in '{SAVE_DIRECTORY}'."

            result = f"Artifacts in '{SAVE_DIRECTORY}':\n\n"
            for i, file in enumerate(files, 1):
                file_path = os.path.join(SAVE_DIRECTORY, file)
                file_size = os.path.getsize(file_path)
                file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                logger.debug(f"File {i}: {file}, Size: {file_size} bytes, Modified: {file_time}")
                result += f"{i}. {file}\n   Size: {file_size} bytes\n   Modified: {file_time}\n\n"

            return result
        except Exception as e:
            error_msg = f"Error listing artifacts: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            return error_msg
    except Exception as e:
        error_msg = f"Unexpected error in list_saved_artifacts: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        return error_msg

if __name__ == "__main__":
    try:
        # Ensure default save directory exists
        logger.info(f"Ensuring default save directory exists: {SAVE_DIRECTORY}")
        if not os.path.exists(SAVE_DIRECTORY):
            logger.info(f"Creating default save directory: {SAVE_DIRECTORY}")
            os.makedirs(SAVE_DIRECTORY, exist_ok=True)

        logger.info(f"Artifact Saver MCP Server starting...")
        logger.info(f"Default save directory: {SAVE_DIRECTORY}")

        # Start the MCP server
        logger.info("Starting MCP server with stdio transport")
        mcp.run(transport='stdio')
    except Exception as e:
        logger.critical(f"Fatal error starting server: {str(e)}")
        logger.critical(traceback.format_exc())
        sys.exit(1)
