from datetime import datetime
from app.schemas.event import EventCreate

def test_event_schema_validation():
    event_data = {
        "title": "Global Tech Summit 2026",
        "description": "Annual AI & Cloud Technology Conference",
        "category_id": "cat_123",
        "venue_id": "ven_456",
        "start_time": datetime.utcnow(),
        "end_time": datetime.utcnow(),
        "capacity": 500,
        "price": 149.99,
        "tags": ["AI", "Tech", "Cloud"]
    }
    event = EventCreate(**event_data)
    assert event.title == "Global Tech Summit 2026"
    assert event.capacity == 500
    assert event.price == 149.99
