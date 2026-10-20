class RIASECEngine:
    def __init__(self):
        # Question IDs follow the six consecutive category groups shown by the frontend.
        self.question_mapping = {
            **{question_id: "R" for question_id in range(1, 8)},
            **{question_id: "I" for question_id in range(8, 15)},
            **{question_id: "A" for question_id in range(15, 22)},
            **{question_id: "S" for question_id in range(22, 29)},
            **{question_id: "E" for question_id in range(29, 36)},
            **{question_id: "C" for question_id in range(36, 43)},
        }

    def calculate_scores(self, user_responses: dict) -> dict:
        """
        Frontend se aane wale responses ko calculate karta hai.
        user_responses format: {"1": 1, "2": 0, "3": 1 ... "42": 0} 
        (1 ka matlab check/yes, 0 ka matlab uncheck/no)
        """
        # Shuruat mein sab ke points zero hain
        scores = {"R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0}
        
        for q_str, answered in user_responses.items():
            q_id = int(q_str)
            if answered == 1 and q_id in self.question_mapping:
                category = self.question_mapping[q_id]
                scores[category] += 1
                
        return scores

    def get_top_three_code(self, scores: dict) -> str:
        """
        Sub se zyada score karne wale top 3 categories ko mila kar 3-letter code banata hai.
        Jaise agar sab se zyada score I, phir C, phir S ka ho to output 'ICS' hoga.
        """
        # Scores ko descending order (zyada se kam) mein sort karna
        sorted_codes = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        # Top 3 letters ko aapas mein jor dena
        interest_code = "".join([code[0] for code in sorted_codes[:3]])
        return interest_code
