# Luna

Generate Genshin Impact character profile images from UID using Node.js and TypeScript.

## Installation

```bash
npm install @kiznavierr/luna
```

## Usage

```typescript
import { ProfileGenerator } from "@kiznavierr/luna";

const generator = new ProfileGenerator();

const result = await generator.generateProfile("856012067", {
  outputFormat: "path",
  outputPath: "profile.png",
});

console.log("Profile generated successfully");
```

## Options

### ProfileGeneratorOptions

- `outputFormat`: `"buffer" | "base64" | "path"` - Output format
- `outputPath`: `string` - File path when using "path" format
- `hideUID`: `boolean` - Hide UID in generated image

### Output Formats

- `"buffer"`: Returns image as Buffer
- `"base64"`: Returns image as base64 string
- `"path"`: Saves image to specified path

## API

### ProfileGenerator

#### generateProfile(uid: string, options?: ProfileGeneratorOptions): Promise<ProfileResult>

Generates a profile image for the given UID.

**Parameters:**

- `uid`: Player UID (string)
- `options`: Generation options (optional)

**Returns:** Promise resolving to ProfileResult

### ProfileResult

- `buffer`: Image buffer (when outputFormat is "buffer")
- `base64`: Base64 string (when outputFormat is "base64")
- `path`: File path (when outputFormat is "path")
- `metadata`: Generation metadata

## License

See [LICENSE](LICENSE) file
