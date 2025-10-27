import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from x402.fastapi.middleware import require_payment
from x402.facilitator import FacilitatorConfig
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Solana USDC Payment Gateway")

# Setup templates
templates = Jinja2Templates(directory="templates")

# Environment configuration
RECIPIENT_ADDRESS = os.getenv("ADDRESS", "")
FACILITATOR_URL = os.getenv("FACILITATOR_URL", "https://facilitator.payai.network")
# NOTE: x402 currently supports: base, base-sepolia, avalanche-fuji, avalanche
# Solana is NOT supported yet by x402
NETWORK = os.getenv("NETWORK", "base-sepolia")

if not RECIPIENT_ADDRESS:
    raise ValueError("ADDRESS environment variable must be set with your EVM wallet address")

# Configure x402 facilitator
facilitator_config = FacilitatorConfig(url=FACILITATOR_URL)

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
    price="0.01",  # 0.01 USDC
    pay_to_address=RECIPIENT_ADDRESS,
    network=NETWORK,
    facilitator_config=facilitator_config
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
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
