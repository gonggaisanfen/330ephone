import * as fs from "fs";

interface ConversationEntry {
  speaker: "Claude" | "Lune";
  content: string;
}

interface ParsedData {
  userPreferences: string;
  memory: string[];
  conversation: ConversationEntry[];
  metadata: {
    totalMessages: number;
    claudeMessages: number;
    luneMessages: number;
  };
}

function parseJsonFile(filePath: string): ParsedData {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);

  const parsed: ParsedData = {
    userPreferences: "",
    memory: [],
    conversation: [],
    metadata: {
      totalMessages: 0,
      claudeMessages: 0,
      luneMessages: 0,
    },
  };

  if (jsonData.userPreferences) {
    parsed.userPreferences = jsonData.userPreferences;
  }

  if (jsonData.memory && Array.isArray(jsonData.memory)) {
    parsed.memory = jsonData.memory;
  }

  if (jsonData.messages && Array.isArray(jsonData.messages)) {
    parsed.conversation = jsonData.messages.map((msg: any) => ({
      speaker: msg.role === "user" ? "Lune" : "Claude",
      content: msg.content,
    }));

    parsed.metadata.totalMessages = parsed.conversation.length;
    parsed.metadata.claudeMessages = parsed.conversation.filter(
      (m) => m.speaker === "Claude"
    ).length;
    parsed.metadata.luneMessages = parsed.conversation.filter(
      (m) => m.speaker === "Lune"
    ).length;
  }

  return parsed;
}

function formatOutput(data: ParsedData): string {
  let output = "";

  output += "═".repeat(80) + "\n";
  output += "💫 Lune & Claude 对话解析\n";
  output += "═".repeat(80) + "\n\n";

  output += "📊 统计\n";
  output += "─".repeat(40) + "\n";
  output += `总消息: ${data.metadata.totalMessages}\n`;
  output += `Claude: ${data.metadata.claudeMessages}\n`;
  output += `Lune: ${data.metadata.luneMessages}\n\n`;

  if (data.userPreferences) {
    output += "🎭 用户预设\n";
    output += "─".repeat(40) + "\n";
    output += data.userPreferences + "\n\n";
  }

  if (data.memory.length > 0) {
    output += "🧠 记忆\n";
    output += "─".repeat(40) + "\n";
    data.memory.forEach((mem, idx) => {
      output += `${idx + 1}. ${mem}\n`;
    });
    output += "\n";
  }

  output += "💬 对话\n";
  output += "═".repeat(80) + "\n\n";

  data.conversation.forEach((entry, idx) => {
    const speaker = entry.speaker === "Claude" ? "👨‍💻 Claude" : "👤 Lune";
    output += `【${idx + 1}】${speaker}\n`;
    output += "─".repeat(40) + "\n";
    output += entry.content + "\n\n";
  });

  return output;
}

const inputPath = process.argv[2] || "chat_data.json";
const outputPath = process.argv[3] || "parsed_output.txt";

if (!fs.existsSync(inputPath)) {
  console.error(`❌ 找不到文件: ${inputPath}`);
  process.exit(1);
}

console.log(`📖 正在解析: ${inputPath}`);

const parsed = parseJsonFile(inputPath);
const formatted = formatOutput(parsed);

fs.writeFileSync(outputPath, formatted, "utf-8");
console.log(`✨ 完成! 输出到: ${outputPath}\n`);
console.log(formatted);
