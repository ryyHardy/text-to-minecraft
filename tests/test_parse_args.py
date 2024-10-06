import pytest
from main import parse_args

def test_parse_args_basic():
    host, port = parse_args(["mc.hypixel.net", "25565"])
    assert host == "mc.hypixel.net"
    assert port == 25565

def test_parse_args_too_many():
    with pytest.raises(ValueError):
        parse_args(["mc.hypixel.net", "25565", "some third thing"])

def test_parse_args_too_few():
    with pytest.raises(ValueError):
        parse_args(["mc.hypixel.net"])

def test_parse_args_port_not_int():
    with pytest.raises(ValueError):
        parse_args(["mc.hypixel.net", "abcde"])
    