#!/usr/bin/env bash
# PreToolUse hook (Bash matcher): blocks git operations that directly
# switch onto, delete, or force-push to a protected branch
# (main/master/dev/develop). Does NOT block creating a new branch off one
# of them (e.g. `git checkout -b feature/x develop`), which is a normal,
# safe workflow.
set -euo pipefail

cmd="$(node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{try{process.stdout.write(JSON.parse(d).tool_input?.command||"")}catch{}})')"
protected='\b(main|master|dev|develop)\b'

deny() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Blocked: %s. Protected branches are main/master/dev/develop (see CLAUDE.md git workflow)."}}\n' "$1"
  exit 0
}

# checkout/switch directly onto a protected branch (allowed when -b/-B creates a new branch instead)
if printf '%s' "$cmd" | grep -qE '(^|[;&|])\s*git\s+(checkout|switch)\b' \
   && ! printf '%s' "$cmd" | grep -qE '\s-[bB]\b' \
   && printf '%s' "$cmd" | grep -qE "$protected"; then
  deny "checking out a protected branch directly"
fi

# deleting a protected branch
if printf '%s' "$cmd" | grep -qE '(^|[;&|])\s*git\s+branch\s+.*-[dD]\b' \
   && printf '%s' "$cmd" | grep -qE "$protected"; then
  deny "deleting a protected branch"
fi

# force-pushing to a protected branch
if printf '%s' "$cmd" | grep -qE '(^|[;&|])\s*git\s+push\b' \
   && printf '%s' "$cmd" | grep -qE -- '--force\b|-f\b' \
   && printf '%s' "$cmd" | grep -qE "$protected"; then
  deny "force-pushing to a protected branch"
fi

exit 0
