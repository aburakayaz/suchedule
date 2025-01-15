from typing import List, Dict

import requests
import json
import sys

from bs4 import BeautifulSoup


class SUcheduleCourseScraper:
    def __init__(self, term: int):
        self.term = term
        self.instructors = []
        self.places = []

    def run(self) -> None:
        """
        Run required flow for getting course schedule and saving to a .json file
        """
        course_codes = self.get_course_codes()
        print("Course codes are fetched.")
        course_datas = self.get_courses_data(codes=course_codes)
        print("Course data is fetched.")
        self.write_json_file(courses=course_datas,places=self.places,instructors=self.instructors)
        print("Json file is created.")

    def get_course_codes(self) -> List[str]:
        """
        Get courses code from bannerweb.
        """

        # Sets header and payload
        payload = {'p_calling_proc': 'bwckschd.p_disp_dyn_sched', 'p_term': self.term}
        headers = {'Content-type': 'application/x-www-form-urlencoded'}

        # Sends request to bannerweb
        data = requests.post(f"https://suis.sabanciuniv.edu/prod/bwckgens.p_proc_term_date",
                             data=payload, headers=headers)

        # Parses html and catches course codes
        source = BeautifulSoup(data.content, 'html.parser')
        course_codes: List[str] = [course.get("value") for course in source.find_all('option')]

        # Removes unnecessary elements
        course_codes = [code for code in course_codes if code.isupper() and code.isalpha()]

        # Insert dummy element to codes list first position
        course_codes.insert(0, "dummy")

        return course_codes

    def get_courses_data(self, codes: List[str]) -> List:
        """
        Get courses data from bannerweb.
        :return:
            str
        """
        course_informations: List[Dict] = []
        payload = {'term_in': self.term, 'sel_subj': codes, 'sel_day': 'dummy', 'sel_schd': 'dummy',
                   'sel_insm': 'dummy', 'sel_camp': 'dummy', 'sel_levl': 'dummy', 'sel_sess': 'dummy',
                   'sel_instr': 'dummy', 'sel_ptrm': 'dummy', 'sel_attr': 'dummy', 'sel_crse': '', 'sel_title': '',
                   'sel_from_cred': '', 'sel_to_cred': '', 'begin_hh': '0', 'begin_mi': '0', 'begin_ap': 'a',
                   'end_hh': '0', 'end_mi': '0', 'end_ap': 'a'}
        headers = {'Content-type': 'application/x-www-form-urlencoded'}

        # Sends request to bannerweb
        data = requests.post(f"https://suis.sabanciuniv.edu/prod/bwckschd.p_get_crse_unsec",
                             data=payload, headers=headers)

        # Parses html and catches course title, crn code, course code and section code
        source = BeautifulSoup(data.content, 'html.parser')
        courses: List = source.find_all("th", attrs={"class": "ddlabel"})

        # Get course information
        for course in courses:
            course_information = self.get_course_information(course)

            if course_information["section"]:
                course_informations.append(course_information)
            else:
                print(f"Course {course_information['name']} has no section.")

        # Edit course information for json file
        return self.set_course_informations(course_informations)

    def get_course_information(self, course: BeautifulSoup) -> Dict:
        """
        Get course information from a course tag.
        """
        # Catch course name, crn code, course code and section code
        title = course.find("a").text.split("-")

        # Catch course sections
        next_sibling = course.parent.find_next_sibling("tr")
        if next_sibling.find("table") is not None:
            table = [item for item in next_sibling.find("table").find_all("tr") if item.find("td")]
            sections = [row.find_all("td") for row in table]
        else:
            sections = []

        # Add values to dictionary
        course_information = {
            "name": title[0],
            "crn": title[-3],
            "code": title[-2],
            "section": [
                {
                    "day": schedule[2].text,
                    "time": schedule[1].text,
                    "place": schedule[3].text,
                    "instructor": schedule[6].text,
                    "group": title[-1],
                } for schedule in sections
            ]
        }

        return course_information

    def set_course_informations(self, course_informations: List[Dict]) -> List[Dict]:
        """
        Edit course information for json file.
        """
        data = []
        for course_info in course_informations:
            name = self.set_course_name(course_info["name"])
            code = self.set_course_code(course_info["code"])
            crn = self.remove_blank_spaces(course_info["crn"])
            course_class = self.set_course_class(course_info["section"], course_info["code"], crn)

            course = next((item for item in data if item["code"] == code), None)
            if course is not None:
                classes = next((item for item in course["classes"] if item["type"] == course_class["type"]), None)
                if classes is None:
                    course["classes"].append({
                        "type": course_class["type"],
                        "sections": [course_class["sections"]]
                    })
                else:
                    classes["sections"].append(course_class["sections"])

            else:
                data.append({
                    "name": name,
                    "code": code,
                    "classes": [{
                        "type": course_class["type"],
                        "sections": [course_class["sections"]]
                    }]
                })

        return data

    def set_course_class(self, section: List[Dict], code: str, crn: str) -> Dict:
        """
        Edit course schedule for json file.
        """
        code = self.remove_blank_spaces(code)
        course_type = self.set_course_type(code)

        course_class = {
            "type": course_type,
            "sections": self.set_course_sections(section, crn)
        }

        return course_class

    def set_course_sections(self, section: List[Dict], crn: str) -> Dict:
        """
        Edit course schedule for json file.
        """
        schedules = []
        for schedule in section:
            day = self.set_course_day(schedule["day"])
            start, duration = self.set_course_time(schedule["time"])
            place = self.set_place(schedule["place"])
            group = self.remove_blank_spaces(section[0]["group"])
            schedules.append({
                "day": day,
                "place": place,
                "start": start,
                "duration": duration,
            })

        sections = {
            "crn": crn,
            "schedule": schedules,
            "group": group,
            "instructors": self.set_course_instructor(section[0]["instructor"]),
        }

        return sections

    @staticmethod
    def set_course_name(name: str) -> str:
        """
        Edit course name for json file.
        """
        if "Lab" in name and "Labor" not in name:
            name = name.replace("Lab", "")

        if "Recitation" in name:
            name = name.replace("Recitation", "")

        if "Discussion" in name:
            name = name.replace("Discussion", "")

        if name[-1] == " " or name[-1] == ",":
            name = name[:-1]

        if name[0] == " ":
            name = name[1:]

        return name

    @staticmethod
    def set_course_code(code: str) -> str:
        """
        Edit course code for json file.
        """
        if code[-1] == " ":
            code = code[:-1]

        if code[0] == " ":
            code = code[1:]

        if code[-1].isalpha():
            code = code[:-1]

        return code

    @staticmethod
    def remove_blank_spaces(text: str) -> str:
        """
        Edit course crn for json file.
        """
        if text[-1] == " ":
            text = text[:-1]

        if text[0] == " ":
            text = text[1:]

        return text

    @staticmethod
    def set_course_type(code: str) -> str:
        if code[-1] == "L":
            return "L"
        elif code[-1] == "D":
            return "D"
        elif code[-1] == "R":
            return "R"
        elif code[-1] == "N":
            return "N"
        elif code[-1] == "S":
            return "S"
        elif code[-1] == "E":
            return "E"
        else:
            return ""

    @staticmethod
    def set_course_day(day: str) -> int:
        """
        Edit course day for json file.
        """
        day_list = ["M", "T", "W", "R", "F", "S", "U"]
        try:
            return day_list.index(day)
        except ValueError:
            return 5

    @staticmethod
    def set_course_time(time: str) -> (int, int):
        """
        Edit course time for json file.
        """
        time = time.split(" - ")
        start_list = ['8:40 am', '9:40 am', '10:40 am', '11:40 am', '12:40 pm', '1:40 pm', '2:40 pm', '3:40 pm',
                      '4:40 pm', '5:40 pm', '6:40 pm', '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm',
                      '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '9:30 am', '10:30 am',
                      '11:30 am', '12:30 pm', '1:30 pm', '2:30 pm', '3:30 pm', '4:30 pm', '5:30 pm', '6:30 pm',
                      '7:30 pm']
        end_list = ['9:30 am', '10:30 am', '11:30 am', '12:30 pm', '1:30 pm', '2:30 pm', '3:30 pm', '4:30 pm',
                    '5:30 pm', '6:30 pm', '7:30 pm', '9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm',
                    '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm', '10:15 am', '11:15 am',
                    '12:15 pm', '1:15 pm', '2:15 pm', '3:15 pm', '4:15 pm', '5:15 pm', '6:15 pm', '7:15 pm',
                    '8.15 pm']

        try:
            start = start_list.index(time[0]) % 11
            end = end_list.index(time[1]) % 11
            duration = end - start + 1 if end >= start else -1

        except ValueError:
            start = -1
            duration = -1

        return start, duration

    def set_course_instructor(self, instructor: str) -> int:
        """
        Edit course instructor for json file.
        """
        instructor = " ".join(instructor.split())

        if instructor not in self.instructors:
            self.instructors.append(instructor)

        return self.instructors.index(instructor)

    def set_place(self, place: str) -> int:
        """
        Edit course place for json file.
        """
        place = place.replace("Fac.of Arts and Social Sci.", "FASS")
        place = place.replace("Sabancı Business School", "FMAN")
        place = place.replace("Fac. of Engin. and Nat. Sci.", "FENS")
        place = place.replace("School of Languages Building", "SL")
        place = place.replace("University Center", "UC")

        if place not in self.places:
            self.places.append(place)

        return self.places.index(place)

    @staticmethod
    def write_json_file(courses: List[Dict], instructors: List[str], places: List[str]):
        """
        Write json file.
        """
        data = {"courses": courses,
                "instructors": instructors,
                "places": places}
        with open("data.min.json", "w", encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False)


if __name__ == '__main__':
    term = int(sys.argv[1])
    scraper = SUcheduleCourseScraper(term=term)
    scraper.run()
