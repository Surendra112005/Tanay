import sounddevice as sd

print(sd.query_devices())
print("\nDefault Device:", sd.default.device)