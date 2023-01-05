# 12_week_year_telegram_bot
Telegram bot for managing 12 week year tasks. Telegram+google sheets+google script

## 12 Week Year System description

The 12 Week Year is a management system that aims to help set and achieve goals more effectively. It is based on the idea that by focusing on a 12 week period, rather than a traditional 12 month year, people can create a sense of urgency and make more progress in a shorter amount of time.
Feel free to search for more information regarding this time management system.

## INSTALLATION AND SETUP 

1. Copy [this google sheets template](https://docs.google.com/spreadsheets/d/17l0ZAdhq5ma_ePRZgc24IM9z8HG-rJReYDU-RIi5IA0) on your own google disc.
2. Open copied sheet and go to the "apps script":

<img src="https://user-images.githubusercontent.com/110247723/210877259-45ed2c46-b145-471d-9ebc-a5a0d70af26e.png" width="20%">

3. In opened script editor create a new file and paste code from [TgScript.gs file](https://github.com/DzHolub/12_week_year_telegram_bot/blob/main/TgScript.gs).
4. Save project and press "deploy" -> "New deployment". Provide all necessary confirmations. Copy web-app url on the final step.

<img src="https://user-images.githubusercontent.com/110247723/210880027-77a65d7d-bbd9-42f5-96e9-564619a9c38a.png" width="20%">

5. Paste copied web-app url into webAppUrl variable
6. Copy google sheet's ID (see picture below) and paste it into ssId variable 

<img src="https://user-images.githubusercontent.com/110247723/210883391-dc1b6364-856d-42f5-95e1-6d1582876b28.png" width="60%">

7. Create own Telegram bot with BotFather (instructions may be easily find in the internet).
6. Copy created bot's API key and paste it into apiToken variable.
7. Press "deploy" again and then "manage deployments" -> edit deployment as a new version.
8. In script editor window choose "initializeScript" and press "Run".
9. Return to the google sheets file:
* in "data" sheet change "B1" cell with desired year
* fill quarter and weekly tasks in "quarter_tasks_db" and "weekly_tasks_db" respectively. The 1st tasks in a row are always the most important tasks
10. Go to telegram bot chat and press "start" or use \start command.
11. Enjoy

## USAGE

* Type .[TASK NUMBER] [TASK DESCRIPTION] in order to add or change a week task with desired number. Ex.: .1 Buy a car
* Type ![TASK NUMBER] [TASK PROGRESS %] in order to change a week task's progress percent with desired number. Ex.: !2 23%
* Type @[TASK NUMBER] [TASK PROGRESS %] in order to add or change a quarter task with desired number. Ex.: @4 Relocate to Antarctica
* Type '[TASK NUMBER] [TASK PROGRESS %] in order to change a task's progress percent with desired number. Ex.: '2 100%
* /refresh - command to actualize data from sheets
* /help - command to get information about existing commands
