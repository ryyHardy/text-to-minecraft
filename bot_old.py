            # else: #! Otherwise, get response using the LLM
            #     completion = self.openai_client.chat.completions.create(
            #         model="gpt-4o-mini",
            #         messages=[
            #             {"role": "system", "content": CHATBOT_ROLE},
            #             {"role": "user", "content": message}
            #         ]
            #     )
            #     self.bot.chat(completion.choices[0].message.content)
