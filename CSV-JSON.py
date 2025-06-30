import csv
import json
import os

# Obtener la ruta del directorio actual donde está el script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Configurar las rutas de los archivos
csv_file_path = os.path.join(current_dir, "diario.csv")
json_file_path = os.path.join(current_dir, "DiarioJson.json")

try:
    with open(csv_file_path, mode="r", encoding="utf-8") as csv_file:
        # Usamos el delimitador de punto y coma
        reader = csv.DictReader(csv_file, delimiter=";")

        # Imprimir los encabezados detectados
        print("Encabezados detectados:", reader.fieldnames)

        # Crear una lista de diccionarios con las claves "date" y "content"
        data = []
        for row in reader:
            # Limpieza de claves por si tienen BOM o espacios adicionales
            cleaned_row = {key.strip().replace('\ufeff', ''): value.strip() for key, value in row.items()}

            # Verificar el valor de 'date'
            date_value = cleaned_row.get("date", "").strip()
            content_value = cleaned_row.get("content", "").strip()

            data.append({"date": date_value, "content": content_value})

    # Guardar el JSON en el archivo especificado
    with open(json_file_path, mode="w", encoding="utf-8") as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)

    print(f"Archivo JSON generado exitosamente: {json_file_path}")
except FileNotFoundError:
    print(f"El archivo CSV '{csv_file_path}' no fue encontrado.")
except KeyError as e:
    print(f"La columna especificada no existe en el CSV: {e}")
except Exception as e:
    print(f"Se produjo un error: {e}")
