import logging
import sys
from logging.handlers import RotatingFileHandler
import os

def setup_logging():
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Create formatters
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    # File handler for backend logs
    backend_file_handler = RotatingFileHandler(
        'logs/backend.log',
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    backend_file_handler.setFormatter(file_formatter)
    root_logger.addHandler(backend_file_handler)

    # File handler for AI service logs
    ai_file_handler = RotatingFileHandler(
        'logs/ai_service.log',
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    ai_file_handler.setFormatter(file_formatter)
    root_logger.addHandler(ai_file_handler)

    # Set specific loggers
    logging.getLogger('uvicorn').setLevel(logging.INFO)
    logging.getLogger('fastapi').setLevel(logging.INFO)
    logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
    
    # Create logger for AI service
    ai_logger = logging.getLogger('ai_service')
    ai_logger.setLevel(logging.INFO)
    ai_logger.addHandler(console_handler)
    ai_logger.addHandler(ai_file_handler)

    return root_logger 