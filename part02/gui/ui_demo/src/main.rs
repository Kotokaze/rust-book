use iced::{executor, Application, Command, Element, Settings, Text};

struct GUI;

impl Application for GUI {
    type Executor = executor::Null;
    type Message = ();
    type Flags = ();

    fn new(_flags: ()) -> (GUI, Command<Self::Message>) {
        return (GUI, Command::none());
    }

    fn title(&self) -> String {
        return String::from("Demo");
    }

    fn update(&mut self, _message: Self::Message) -> Command<Self::Message> {
        return Command::none();
    }

    fn view(&mut self) -> Element<Self::Message> {
        return Text::new("Hello, world!").into();
    }
}

fn main() {
    GUI::run(Settings::default());
}
