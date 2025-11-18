import sys

def format_text(filename):
    """Read a text file and format it with emojis and spacing."""
    
    # Emoji mapping
    replacements = {
        '!': '💣',
        'o': '👍',
        'x': '👎',
        '?': '❓',
        '#': '🤔',
        #'0': '0️⃣',
        #'1': '1️⃣',
        #'2': '2️⃣',
        #'3': '3️⃣',
        #'4': '4️⃣',
        #'5': '5️⃣',
        #'6': '6️⃣',
        #'7': '7️⃣',
        #'8': '8️⃣',
        #'9': '9️⃣',
        '0': '𝟎',
        '1': '𝟏',
        '2': '𝟐',
        '3': '𝟑',
        '4': '𝟒',
        '5': '𝟓',
        '6': '𝟔',
        '7': '𝟕',
        '8': '𝟖',
        '9': '𝟗'
    }
    
    try:
        with open(filename, 'r') as f:
            lines = f.readlines()
        
        # Process each line
        for line in lines:
            formatted_chars = []
            for char in line.rstrip('\n'):
                # Replace with emoji if in mapping, otherwise keep original
                new_char = replacements.get(char, char)
                formatted_chars.append(new_char)
            
            # Join with spaces and print
            print(' '.join(formatted_chars))
    
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python board_viewer.py <filename>")
        sys.exit(1)
    
    filename = sys.argv[1]
    format_text(filename)

