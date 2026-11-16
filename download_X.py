import os
import urllib.request

OUTPUT_DIR = "X"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Remplace ces exemples par tes 38 liens directs d'images
IMAGE_URLS = [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    # ... ajoute tes 38 liens ici ...
]

def main():
    print(f"🚀 Début du téléchargement vers le dossier '{OUTPUT_DIR}'...")
    for i, url in enumerate(IMAGE_URLS, start=1):
        if i > 38: break
        filename = f"{i:02d}.jpg"
        filepath = os.path.join(OUTPUT_DIR, filename)
        try:
            urllib.request.urlretrieve(url.strip(), filepath)
            print(f"  ✅ Succès -> {filepath}")
        except Exception as e:
            print(f"  ❌ Échec pour {filename} : {e}")
    print("✨ Téléchargement terminé !")

if __name__ == "__main__":
    main()
