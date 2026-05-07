/**
 * TerminalEngine - Narrative command interpreter for ARG-style puzzle system.
 */

class TerminalEngine {
  constructor() {
    // External event hook (UI / audio / effects)
    this.onEvent = null;

    this.state = {
      unlockedButterfly: false,
      discoveredPidima: false,
      hasPerformedBinaryDecode: false,
      executedFlags: new Set(),
      decodedKeywords: new Set(),
    };

    this.messages = [
      ">> MESSAGE ARCHIVE: 0x1A4",
      "The static is getting louder. I can see the wings shifting in the code.",
      "base64 sequence identified: cGlkaW1h",
      "--------------------------",
      ">> MESSAGE ARCHIVE: 0x2B9",
      "They say the court was abandoned in '98. The ghosts of pidima still play.",
      "The orange sphere is the only key left in this circuit.",
      "--------------------------",
      ">> MESSAGE ARCHIVE: 0x3C1",
      "Everything is a loop. A jester's laugh is the final sound before the reboot.",
    ];
  }

  // Central event dispatcher
  triggerEvent(event) {
    if (this.onEvent) this.onEvent(event);
  }

  process(input) {
    const raw = input.trim();
    if (!raw) return "";

    const parts = raw.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        return this.handleHelp();
      case "messages":
        return this.handleMessages();
      case "decode":
        return this.handleDecode(args);
      case "execute":
        return this.handleExecute(args);
      default:
        return ">> error: command not recognized";
    }
  }

  handleHelp() {
    return [
      ">> command list",
      "",
      "help        → shows available commands",
      "messages    → opens mailbox / message archive",
      "decode      → decodes encoded data (binary / base64)",
      "execute     → runs system actions using flags (--command)",
    ].join("\n");
  }

  handleMessages() {
    this.state.discoveredPidima = true;
    return this.messages.join("\n");
  }

  handleDecode(args) {
    if (args.length < 2) return ">> error: missing required input data";

    const type = args[0];
    const data = args.slice(1).join(" ");

    if (type === "--binary") {
      const binaryParts = data.split(/\s+/);
      let text = "";

      binaryParts.forEach((bin) => {
        if (bin.length === 8) {
          text += String.fromCharCode(parseInt(bin, 2));
        }
      });

      if (data.includes("11110000 10011111 10100110 10001011")) {
        this.state.unlockedButterfly = true;
        this.state.hasPerformedBinaryDecode = true;
        return "Butterfly";
      }

      if (text) {
        this.state.hasPerformedBinaryDecode = true;
        return `>> decoded: ${text}`;
      }

      return ">> decode error: invalid binary sequence";
    }

    if (type === "--base64") {
      try {
        return `>> decoded: ${atob(data)}`;
      } catch {
        return ">> decode error: invalid base64 input";
      }
    }

    return ">> error: invalid decode format";
  }

  handleExecute(args) {
    if (args.length < 1) return ">> error: missing flag";

    const flag = args[0];
    if (!flag.startsWith("--")) {
      return ">> error: invalid flag format";
    }

    const key = flag.slice(2).toLowerCase();

    switch (key) {
      case "melon":
        return ">> you're bald and we love u";

      case "pidima":
        if (this.state.discoveredPidima) {
          return [
            ">> Pidima unlocked",
            '>> "how did you find this?"',
            ">> Album: Pidima",
            ">> Concept: Basketball",
            ">> Release Date: TBA",
          ].join("\n");
        }
        return ">> access denied: missing reference";

      case "butterfly":
        if (this.state.unlockedButterfly) {
          return ">> butterfly -10/28/24, the day I met my muse.";
        }
        return ">> access denied: signal not found";

      case "jester":
        this.triggerEvent({
          type: "play-audio",
          payload: encodeURI("/audio/Jester Laugh Reverb.mp3"),
        });
        return ">>...";

      case "salchichongo":
        this.triggerEvent({
          type: "play-audio",
          payload: encodeURI("/audio/sorpresa.mp3"),
        });
        return ">> tontopoia";

      default:
        return ">> error: flag not recognized";
    }
  }
}

export default new TerminalEngine();
