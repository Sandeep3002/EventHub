from app.schemas.registration import RegistrationCreate

def test_registration_schema_validation():
    reg_data = {
        "event_id": "evt_789",
        "ticket_id": "tkt_101",
        "quantity": 2
    }
    reg = RegistrationCreate(**reg_data)
    assert reg.event_id == "evt_789"
    assert reg.quantity == 2
