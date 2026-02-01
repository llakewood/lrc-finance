#!/usr/bin/env python3
"""
Run the Little Red Coffee Financial Dashboard

Usage:
    python run.py

Then open http://127.0.0.1:8000 in your browser.
"""

import uvicorn

if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("  Little Red Coffee - Financial Dashboard")
    print("=" * 50)
    print("\n  Starting server at http://127.0.0.1:8000")
    print("  Press Ctrl+C to stop\n")

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
