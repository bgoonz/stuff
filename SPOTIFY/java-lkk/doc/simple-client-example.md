Example Usage of LeanKitKanbanSimpleClient:

    HttpDriver driver = new DefaultHttpDriver("<company>.leankitkanban.com", 443, "username", "password");
    DefaultLeanKitKanbanApi api = new DefaultLeanKitKanbanApi(driver);

    LeanKitKanbanSimpleClient client = new LeanKitKanbanSimpleClient(api);
    // Currently problematic.
    //LeanKitKanbanBoard board = client.getBoard("Board Name");
    LeanKitKanbanBoard board = client.getBoard(<board-id>);

    Card card = new Card();

    card.setType("Defect");
    card.setTitle("My Title");
    card.setExternalCardId("TEST-1");

    board.addCard(card, "ToDo", 0);
