import argparse
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_IMAGE_DIR = BASE_DIR / "tiles_with_metadata (1)"
DEFAULT_CSV_FILE = BASE_DIR / "image_dataset_1.csv"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}


def image_files_in(image_dir: Path) -> list[Path]:
    return sorted(
        path for path in image_dir.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def normalize_image_dir(image_dir: Path) -> Path:
    """Use an accidentally nested extraction folder as the image root."""
    direct_files = [
        path for path in image_dir.iterdir()
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]
    if direct_files:
        return image_dir

    nested_dirs = [
        path for path in image_dir.iterdir()
        if path.is_dir() and image_files_in(path)
    ]
    return nested_dirs[0] if len(nested_dirs) == 1 else image_dir


def generate_csv(image_dir: Path, csv_file: Path) -> int:
    if not image_dir.is_dir():
        raise FileNotFoundError(
            f"Image directory does not exist: {image_dir}\n"
            "Add the image files there, or pass --image-dir with the correct folder."
        )

    image_dir = normalize_image_dir(image_dir)
    image_files = image_files_in(image_dir)

    if not image_files:
        raise FileNotFoundError(
            f"No supported image files were found in: {image_dir}\n"
            "Supported types: .png, .jpg, .jpeg, .webp, .bmp, .tif, .tiff"
        )

    csv_file.parent.mkdir(parents=True, exist_ok=True)
    with csv_file.open("w", encoding="utf-8", newline="") as f:
        for filepath in image_files:
            filename = filepath.relative_to(image_dir).as_posix()
            stem = filepath.stem
            label = stem.split("_")[0] if "_" in stem else "unknown"
            f.write(f"{filename}|{label}|||||||test|\n")

    return len(image_files)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create the simulator CSV index from existing image files."
    )
    parser.add_argument(
        "--image-dir",
        type=Path,
        default=DEFAULT_IMAGE_DIR,
        help=f"Directory containing images (default: {DEFAULT_IMAGE_DIR})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_CSV_FILE,
        help=f"CSV output path (default: {DEFAULT_CSV_FILE})",
    )
    args = parser.parse_args()

    count = generate_csv(args.image_dir.resolve(), args.output.resolve())
    print(f"✅ Created {args.output.resolve()}: images {count}")


if __name__ == "__main__":
    main()
