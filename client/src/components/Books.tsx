import dateFormat from "dateformat";
import { History } from "history";
import update from "immutability-helper";
import * as React from "react";
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
} from "semantic-ui-react";

import { addNewBook, deleteBook, getBooks, patchBook } from "../api/books-api";
import Auth from "../auth/Auth";
import { Book } from "../types/Book";

interface BooksProps {
  auth: Auth;
  history: History;
}

interface BooksState {
  books: Book[];
  newBookName: string;
  newAuthorName: string;
  loadingBooks: boolean;
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    newBookName: "",
    newAuthorName: "",
    loadingBooks: true,
  };

  handleBookNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookName: event.target.value });
  };

  handleAuthorNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newAuthorName: event.target.value });
  };

  onEditButtonClick = (bookId: string) => {
    this.props.history.push(`/books/${bookId}/edit`);
  };

  onBookCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate();
      const newBook = await addNewBook(this.props.auth.getIdToken(), {
        name: this.state.newBookName,
        author: this.state.newAuthorName,
        dueDate,
      });
      this.setState({
        books: [...this.state.books, newBook],
        newBookName: "",
        newAuthorName: "",
      });
    } catch (e) {
      debugger;
      alert(`Book creation failed!: ${e.message}  ${e}`);
    }
  };

  onBookDelete = async (bookId: string) => {
    try {
      await deleteBook(this.props.auth.getIdToken(), bookId);
      this.setState({
        books: this.state.books.filter((book) => book.bookId != bookId),
      });
    } catch {
      alert("Book deletion failed");
    }
  };

  onBookCheck = async (pos: number) => {
    try {
      const book = this.state.books[pos];
      await patchBook(this.props.auth.getIdToken(), book.bookId, {
        name: book.name,
        author: book.author,
        dueDate: book.dueDate,
        read: !book.read,
      });
      this.setState({
        books: update(this.state.books, {
          [pos]: { read: { $set: !book.read } },
        }),
      });
    } catch (e) {
      alert(`Book read failed!: ${e.message}  ${e}`);
    }
  };

  async componentDidMount() {
    try {
      const books = await getBooks(this.props.auth.getIdToken());
      this.setState({
        books,
        loadingBooks: false,
      });
    } catch (e) {
      alert(`Failed to fetch books: ${e.message}`);
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Books</Header>

        {this.renderCreateBookInput()}

        {this.renderBooks()}
      </div>
    );
  }

  renderCreateBookInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: "teal",
              labelPosition: "left",
              icon: "add",
              content: "New book",
              onClick: this.onBookCreate,
            }}
            fluid
            actionPosition="left"
            placeholder="to discover the world..."
            onChange={this.handleBookNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    );
  }

  renderBooks() {
    if (this.state.loadingBooks) {
      return this.renderLoading();
    }

    return this.renderBooksList();
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading your amazing Books..
        </Loader>
      </Grid.Row>
    );
  }

  renderBooksList() {
    return (
      <Grid padded>
        {this.state.books.map((book, pos) => {
          return (
            <Grid.Row key={book.bookId} verticalAlign="middle">
              <Grid.Column width={1}>
                {this.renderReadIcon(book, pos)}
              </Grid.Column>
              <Grid.Column width={4}>
                {book.attachmentUrl && (
                  <Image src={book.attachmentUrl} size="small" wrapped />
                )}
              </Grid.Column>
              <Grid.Column width={6}>{book.name}</Grid.Column>
              <Grid.Column width={3} floated="right">
                {book.dueDate}
              </Grid.Column>
              <Grid.Column width={1}>
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(book.bookId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1}>
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBookDelete(book.bookId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>

              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          );
        })}
      </Grid>
    );
  }

  renderReadIcon(book: Book, pos: number) {
    return (
      <Button
        icon
        color={book.read ? "green" : "yellow"}
        onClick={() => this.onBookCheck(pos)}
      >
        <Icon name={book.read ? "check" : "book"} />
      </Button>
    );
  }

  calculateDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);

    return dateFormat(date, "yyyy-mm-dd") as string;
  }
}
