class PrinterService:
    def print_ticket(self, session_data: dict):
        """
        Simulates printing a ticket by logging to console/file.
        """
        print("="*30)
        print("      GINHAWA HEALTH KIOSK      ")
        print("="*30)
        print(f"Date: {session_data.get('date')}")
        print(f"Patient: {session_data.get('citizen_name')}")
        print("-" * 30)
        measurements = session_data.get('measurements', [])
        for m in measurements:
            print(f"{m['type'].upper()}: {m['value']} {m['unit']}")
        print("-" * 30)
        print("      Stay Healthy!      ")
        print("="*30)
        return True

printer_service = PrinterService()
