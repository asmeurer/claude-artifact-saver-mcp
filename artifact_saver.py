#!/usr/bin/env python3
import os
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("artifact-saver")

# Global state
SAVE_DIRECTORY = os.path.expanduser("~/claude_artifacts")

@mcp.tool()
async def set_save_directory(directory_path: str) -> str:
    """Set the directory where artifacts will be saved.
    
    Args:
        directory_path: Absolute or relative path to the directory where artifacts should be saved
    
    Returns:
        Confirmation message with the absolute path that was set
    """
    global SAVE_DIRECTORY
    
    # Expand user directory if needed (e.g., ~/artifacts becomes /home/username/artifacts)
    expanded_path = os.path.expanduser(directory_path)
    
    # Convert to absolute path if it's relative
    absolute_path = os.path.abspath(expanded_path)
    
    # Create the directory if it doesn't exist
    if not os.path.exists(absolute_path):
        try:
            os.makedirs(absolute_path, exist_ok=True)
        except Exception as e:
            return f"Error creating directory: {str(e)}"
    
    # Set the global save directory
    SAVE_DIRECTORY = absolute_path
    
    return f"Save directory set to: {SAVE_DIRECTORY}"

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
    global SAVE_DIRECTORY
    
    # Ensure the save directory exists
    if not os.path.exists(SAVE_DIRECTORY):
        try:
            os.makedirs(SAVE_DIRECTORY, exist_ok=True)
        except Exception as e:
            return f"Error creating save directory: {str(e)}"
    
    # Generate filename if not provided
    if not file_name:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"artifact_{timestamp}_{str(uuid.uuid4())[:8]}"
    
    # Clean the filename to avoid path traversal or invalid characters
    clean_filename = "".join(c for c in file_name if c.isalnum() or c in "._- ")
    
    # Clean the file_type (extension)
    clean_file_type = "".join(c for c in file_type if c.isalnum())
    
    # Create full file path
    file_path = os.path.join(SAVE_DIRECTORY, f"{clean_filename}.{clean_file_type}")
    
    # Write content to file
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        return f"Artifact saved successfully to: {file_path}"
    except Exception as e:
        return f"Error saving artifact: {str(e)}"

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
    global SAVE_DIRECTORY
    
    # Ensure the save directory exists
    if not os.path.exists(SAVE_DIRECTORY):
        try:
            os.makedirs(SAVE_DIRECTORY, exist_ok=True)
        except Exception as e:
            return f"Error creating save directory: {str(e)}"
    
    # Generate filename if not provided
    if not file_name:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"artifact_{timestamp}_{str(uuid.uuid4())[:8]}"
    
    # Clean the filename to avoid path traversal or invalid characters
    clean_filename = "".join(c for c in file_name if c.isalnum() or c in "._- ")
    
    # Create full file path
    file_path = os.path.join(SAVE_DIRECTORY, f"{clean_filename}.json")
    
    # Prepare the data structure with content and metadata
    data = {
        "content": content,
        "metadata": metadata,
        "saved_at": datetime.now().isoformat()
    }
    
    # Write to JSON file
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return f"Artifact with metadata saved successfully to: {file_path}"
    except Exception as e:
        return f"Error saving artifact with metadata: {str(e)}"

@mcp.tool()
async def get_save_directory() -> str:
    """Get the current directory where artifacts are being saved.
    
    Returns:
        The absolute path to the current save directory
    """
    global SAVE_DIRECTORY
    return SAVE_DIRECTORY

@mcp.tool()
async def list_saved_artifacts() -> str:
    """List all artifacts saved in the current save directory.
    
    Returns:
        A formatted list of saved artifacts or error message
    """
    global SAVE_DIRECTORY
    
    # Check if directory exists
    if not os.path.exists(SAVE_DIRECTORY):
        return f"Save directory '{SAVE_DIRECTORY}' does not exist."
    
    # List files in the directory
    try:
        files = os.listdir(SAVE_DIRECTORY)
        if not files:
            return f"No artifacts found in '{SAVE_DIRECTORY}'."
        
        result = f"Artifacts in '{SAVE_DIRECTORY}':\n\n"
        for i, file in enumerate(files, 1):
            file_path = os.path.join(SAVE_DIRECTORY, file)
            file_size = os.path.getsize(file_path)
            file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
            result += f"{i}. {file}\n   Size: {file_size} bytes\n   Modified: {file_time}\n\n"
        
        return result
    except Exception as e:
        return f"Error listing artifacts: {str(e)}"

if __name__ == "__main__":
    # Ensure default save directory exists
    if not os.path.exists(SAVE_DIRECTORY):
        os.makedirs(SAVE_DIRECTORY, exist_ok=True)
    
    print(f"Artifact Saver MCP Server starting...")
    print(f"Default save directory: {SAVE_DIRECTORY}")
    mcp.run(transport='stdio')