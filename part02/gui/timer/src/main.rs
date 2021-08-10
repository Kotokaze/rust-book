use iced::{
    button, executor, Align, Application, Button, Column, Command, Element, Font,
    HorizontalAlignment, Length, Row, Settings, Subscription, Text,
};

const FONT: Font = Font::External {
    name: "PixelMplus12-Regular",
    bytes: include_bytes!("../rsc/fonts/PixelMplus12-Regular.ttf"),
};

const FONT_BOLD: Font = Font::External {
    name: "PixelMplus12-Bold",
    bytes: include_bytes!("../rsc/fonts/PixelMplus12-Bold.ttf"),
};

fn main() {
    let mut settings = Settings::default();
    settings.window.size = (400u32, 120u32);

    GUI::run(settings);
}

struct GUI {
    tick_state: TickState,
    start_stop_button_state: button::State,
    reset_button_state: button::State,
}

impl Application for GUI {
    type Executor = executor::Null;
    type Message = Message;
    type Flags = ();

    fn new(_flags: ()) -> (GUI, Command<Self::Message>) {
        return (
            GUI {
                tick_state: TickState::Stopped,
                start_stop_button_state: button::State::new(),
                reset_button_state: button::State::new(),
            },
            Command::none(),
        );
    }

    fn title(&self) -> String {
        return String::from("Stopwatch");
    }

    fn update(&mut self, message: Self::Message) -> Command<Self::Message> {
        match message {
            Message::Start => {
                self.tick_state = TickState::Running;
            }
            Message::Stop => {
                self.tick_state = TickState::Stopped;
            }
            Message::Reset => {}
        }
        return Command::none();
    }

    fn view(&mut self) -> Element<Self::Message> {
        let tick_text: Text = Text::new("00:00:00.00").font(FONT_BOLD).size(60);

        let start_stop_text = match self.tick_state {
            TickState::Stopped => Text::new("Start")
                .horizontal_alignment(HorizontalAlignment::Center)
                .font(FONT),
            TickState::Running => Text::new("Stop")
                .horizontal_alignment(HorizontalAlignment::Center)
                .font(FONT),
        };

        let start_stop_message = match self.tick_state {
            TickState::Stopped => Message::Start,
            TickState::Running => Message::Stop,
        };

        let start_stop_button = Button::new(&mut self.start_stop_button_state, start_stop_text)
            .min_width(80)
            .on_press(start_stop_message);

        let reset_button = Button::new(
            &mut self.reset_button_state,
            Text::new("Reset")
                .horizontal_alignment(HorizontalAlignment::Center)
                .font(FONT),
        )
        .min_width(80)
        .on_press(Message::Reset);

        return Column::new()
            .push(tick_text)
            .push(
                Row::new()
                    .push(start_stop_button)
                    .push(reset_button)
                    .spacing(10),
            )
            .spacing(10)
            .padding(10)
            .width(Length::Fill)
            .height(Length::Fill)
            .align_items(Align::Center)
            .into();
    }
}

#[derive(Debug, Clone)]
enum Message {
    Start,
    Stop,
    Reset,
}

enum TickState {
    Stopped,
    Running,
}
