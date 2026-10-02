import imageio
import sys

def convert_webp_to_mp4(input_path, output_path):
    print(f"Reading WebP from {input_path}...")
    try:
        reader = imageio.get_reader(input_path)
        fps = reader.get_meta_data().get('fps', 10) # default to 10 fps if not found
        
        print(f"Writing MP4 to {output_path} at {fps} fps...")
        writer = imageio.get_writer(output_path, format='FFMPEG', fps=fps, macro_block_size=None, codec='libx264')
        
        count = 0
        for frame in reader:
            writer.append_data(frame)
            count += 1
            if count % 50 == 0:
                print(f"Processed {count} frames...")
                
        writer.close()
        print(f"Successfully converted! Total frames: {count}")
    except Exception as e:
        print(f"Error during conversion: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_video.py <input.webp> <output.mp4>")
    else:
        convert_webp_to_mp4(sys.argv[1], sys.argv[2])
