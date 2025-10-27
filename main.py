import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from x402 import require_payment
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Solana USDC Payment Gateway")

# Setup templates
templates = Jinja2Templates(directory="templates")

# Environment configuration
RECIPIENT_ADDRESS = os.getenv("ADDRESS", "")
FACILITATOR_URL = os.getenv("FACILITATOR_URL", "https://facilitator.payai.network")
USDC_TOKEN_ADDRESS = os.getenv("USDC_TOKEN_ADDRESS", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
NETWORK = os.getenv("NETWORK", "solana-mainnet")

if not RECIPIENT_ADDRESS:
    raise ValueError("ADDRESS environment variable must be set with your Solana wallet address")

@app.get("/", response_class=HTMLResponse)
async def payment_page(request: Request):
    """
    Main payment page with the Pay button
    """
    return templates.TemplateResponse(
        "payment.html",
        {
            "request": request,
            "amount": "0.01",
            "currency": "USDC",
            "network": NETWORK
        }
    )

@app.get("/api/payment/initiate")
@require_payment(
    path="/api/payment/initiate",
    price=0.01,  # 0.01 USDC
    recipient=RECIPIENT_ADDRESS,
    network=NETWORK,
    token=USDC_TOKEN_ADDRESS,
    facilitator_url=FACILITATOR_URL
)
async def initiate_payment():
    """
    Payment endpoint - protected by x402 payment requirement
    After successful payment, returns success status
    """
    return {
        "status": "success",
        "message": "Payment received successfully",
        "redirect": "/home/content"
    }

@app.get("/home/content", response_class=HTMLResponse)
async def content_page(request: Request):
    """
    Success page after payment completion
    """
    return templates.TemplateResponse(
        "content.html",
        {"request": request}
    )

@app.get("/health")
async def health_check():
    """
    Health check endpoint for deployment monitoring
    """
    return {
        "status": "healthy",
        "network": NETWORK,
        "recipient": RECIPIENT_ADDRESS[:8] + "..." + RECIPIENT_ADDRESS[-8:] if RECIPIENT_ADDRESS else "not_configured"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
