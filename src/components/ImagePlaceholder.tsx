type ImagePlaceholderProps = {
  label?: string;
};

export default function ImagePlaceholder({ label = "Sin imagen" }: ImagePlaceholderProps) {
  return (
    <div className="image-placeholder">
      <span>{label}</span>
    </div>
  );
}
