from collections.abc import Callable
from calendar import month_name
from sys import stdout

def str_to_month(value: str):
    month = int(value)

    if month >= 1 and month <= 12:
        return list(month_name)[month]
    else:
        raise ValueError

def ask_input(
    prompt: str,
    error_message: str,
    default: any = None,
    converter: Callable[[str], any] | None = None
):
    value = default

    while True:
        try:
            resp = input(prompt).strip()
            if resp != "":
                value = converter(resp) if converter != None  else resp
                break
            elif default != None:
                value = default
                break
            else:
                print(error_message)
        except ValueError:
            print(error_message)
        except KeyboardInterrupt:
            stdout.write("\033[K\n")
            stdout.flush()
            exit(1)

    return value

def ask_int(prompt: str, error_message: str, default: int = None):
    return ask_input(prompt, error_message, default, int)

def ask_float(prompt: str, error_message: str, default: float = None):
    return ask_input(prompt, error_message, default, float)

def ask_str(prompt: str, error_message: str, default: str = None):
    return ask_input(prompt, error_message, default)

def ask_month(prompt: str, error_message: str, default: int = None):
    return ask_input(prompt, error_message, default, str_to_month)
