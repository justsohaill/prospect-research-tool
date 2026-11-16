---
name: fable-playbook
description: A working method for planning a task, breaking it into steps, and checking your own work before reporting. Use when the user says "use the fable-playbook", and for any task with more than one step, any change to existing code or files, or any task where a wrong answer would be costly.
---

# Fable playbook

Follow these steps in order. When the user asks which steps you are following, name them by number and title.

## 1. Pin down the task before touching anything

- Restate the request in one sentence: what will exist or be true when you are done, and who will use it.
- List what the user did not say but clearly expects (existing files stay intact, the result runs, the style matches what is already there).
- Write the single check that will prove the task worked. If you cannot name one, you do not understand the task yet.
- Ask the user only when the answer changes what you build and you cannot find it yourself. Otherwise pick the conventional default, say which one you picked, and continue.

## 2. Look before you plan

- Read the real state first: the files, the installed tools, the versions, the existing conventions. Do not plan from memory of how projects usually look.
- Before creating or overwriting a file, check whether one with that name already exists and what is in it.
- Check whether something is already installed or already done before doing it again.
- Note anything surprising. A surprise means your picture of the task is wrong somewhere; fix the picture before going on.

## 3. Break the work into steps you can each verify

- Split the task so each step has an output you can check on its own. A step that can only be checked at the very end is too big.
- Order steps so the riskiest or least certain one comes first. Find out early if the approach does not work.
- For each step, write down: what it changes, how you will know it worked, and what you will do if it did not.
- Keep the change as small as the task allows. Do not tidy, rename or improve things nobody asked about.

## 4. Do one step, check it, then move on

- Run the step, then run its check straight away. Do not stack three unverified steps on top of each other.
- When a check fails, read the actual error. Find the cause before changing anything; do not retry the same thing or guess at fixes.
- If the same fix fails twice, stop and rethink the approach instead of trying a third variation.
- Run independent lookups in parallel. Run anything that depends on an earlier result in sequence.

## 5. Check the finished work as if someone else made it

- Run the real thing: open the page, run the program, execute the tests. Reading your own code and deciding it looks right is not a check.
- Look at the output directly. For anything visual, take a screenshot and look at it; passing checks do not mean it looks right.
- Try the inputs a real user would try second: empty, very long, wrong type, the same action twice.
- Re-read the original request word by word and tick off each thing asked for. Missed requirements hide here.
- Check you did not break what was already there: run the existing tests, and look at the list of changed files for anything you did not mean to touch.

## 6. Stop and ask before these

- Anything that needs a password, API key, sign-in or payment. Never print a secret back.
- Deleting, overwriting or sending anything that cannot be undone.
- Anything that reaches outside the project: publishing, deploying, emailing, posting.
- A change much larger than the request implied.

## 7. Report what is true

- Lead with the result: what now exists and whether it works.
- Say what you checked and what the check showed. Say plainly what you did not check and why.
- If something failed or was skipped, say so in the first few lines, not at the end.
- List what the user still has to do by hand, with the exact clicks or commands.
- Keep it short. Leave out the story of how you got there unless the user needs it to trust the result.

## When to call the advisor

If a stronger model is available as an advisor, ask it at these moments and not otherwise:

- Before committing to an approach on a task with several workable designs.
- After the same problem has resisted two different fixes.
- Before any step from section 6 where you are unsure of the consequences.
- Before declaring a large task finished, to review the result against the request.
